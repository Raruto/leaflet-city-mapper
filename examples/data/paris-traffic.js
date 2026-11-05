/**
 * Paris traffic, active mobility and public transport for the 'traffic' layer type.
 *
 * @example new L.Layer({ source: { type: 'traffic', url: './examples/data/paris-traffic.js', radius: 2000 } })
 */
import { clipLine } from '../../src/geometry/clipLine.js';
import { samePoint } from '../../src/geometry/samePoint.js';

const hour = 3600000, week = 7 * 24 * hour;
const roadCache = new WeakMap();
const mobilityCache = new WeakMap();
const transitCache = new WeakMap();
const mobilitySource = 'https://opendata.paris.fr/explore/dataset/amenagements-cyclables/';
const mobilityBounds = [2.26, 48.835, 2.38, 48.885];
const sharedPaths = new Set(['voie pi\u00e9tonne', 'voie verte', 'chemin ferm\u00e9 \u00e0 la circulation g\u00e9n\u00e9rale (bois)']);
const transitModes = {
  bus: { type: 'Bus', speed: 5, flow: 12 },
  tram: { type: 'Tram', speed: 7, flow: 15 },
  metro: { type: 'Subway', speed: 10, flow: 24 },
};

/** Route each example layer through its matching Paris data loader. */
export default function parisTraffic(time, layer, signal) {
  if (['bicycle', 'pedestrian'].includes(layer.options.mobilityMode)) return parisMobility(time, layer, signal);
  if (Object.hasOwn(transitModes, layer.options.transitMode)) return parisTransit(time, layer, signal);
  return parisRoadTraffic(time, layer, signal);
}

/** Requested hour, moved back by whole weeks when the counts are not published yet. */
export function trafficHour(date, latest) {
  const time = Math.floor(new Date(date).getTime() / hour) * hour;
  if (!Number.isFinite(time)) throw new Error('Invalid traffic date');
  return new Date(time > latest ? time - Math.ceil((time - latest) / week) * week : time);
}

/** Counts of the hour of `time` within `radius` metres of the layer; the same object is returned while the hour is unchanged. */
export async function parisRoadTraffic(time, layer, signal) {
  const { location, options: { radius = 2000 } } = layer;
  const where = `within_distance(geo_point_2d, geom'POINT(${location.lng} ${location.lat})', ${radius}m) and q > 0`;
  const requested = trafficHour(time, Infinity).toISOString();
  const previous = roadCache.get(layer);
  if (requested === previous?.requested) return previous.data;
  const { results: [last] } = await parisAPI('comptages-routiers-permanents', 'records',
    { limit: 1, select: 'max(t_1h) as hour', where }, signal);
  if (!Number.isFinite(Date.parse(last?.hour))) throw new Error('No traffic counts published');
  const counted = trafficHour(time, Date.parse(last.hour)).toISOString();
  const { features } = await parisAPI('comptages-routiers-permanents', 'exports/geojson', {
    select: 'q,libelle,geo_shape', where: `${where} and t_1h = date'${counted}'`,
  }, signal);
  if (!Array.isArray(features)) throw new Error('Invalid traffic counts');
  const label = new Date(counted).toLocaleString('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const data = {
    type: 'FeatureCollection', hour: counted,
    note: `cars: measured counts of ${label}${counted === requested ? '' : ' (same weekday, latest published)'}`,
    features: features.map(roadFeature),
  };
  if (!features.length) data.note = `cars: no published positive counts for ${counted}; no flow simulated`;
  roadCache.set(layer, { requested, data });
  return data;
}

export async function parisMobility(time, layer, signal) {
  signal.throwIfAborted();
  const mode = layer.options.mobilityMode;
  if (!['bicycle', 'pedestrian'].includes(mode)) throw new Error(`Unknown mobility mode: ${mode}`);
  let state = mobilityCache.get(layer);
  if (!state) { state = {}; mobilityCache.set(layer, state); }
  if (!state.paths) {
    const bounds = trafficBounds(layer);
    const raw = await parisAPI('amenagements-cyclables', 'exports/geojson', {
      select: 'osm_id,nom,amenagement,geo_shape,source,date_export',
      where: boundsQuery('geo_shape', bounds),
    }, signal);
    state.paths = mobilityLanes(raw, mode, bounds);
  }
  if (mode === 'pedestrian') {
    state.paths.note = 'pedestrians: no measured counts available in this source; assumed flow on HTTP-fetched shared paths';
    return state.paths;
  }
  const { location, options: { radius = 2000 } } = layer;
  const where = `within_distance(coordinates,geom'POINT(${location.lng} ${location.lat})',${radius}m)`;
  const requested = trafficHour(time, Infinity).toISOString();
  if (state.requested === requested) return state.data;
  const latest = await parisAPI('comptage-velo-donnees-compteurs', 'records',
    { select: 'max(date) as latest', where, limit: 1 }, signal);
  const date = latest.results?.[0]?.latest;
  if (!Number.isFinite(Date.parse(date))) throw new Error('No cycling counts published');
  const counted = trafficHour(time, Date.parse(date)).toISOString();
  const counts = await parisRecords('comptage-velo-donnees-compteurs', {
    select: 'id_compteur,nom_compteur,sum_counts,date,coordinates',
    where: `${where} and date = date'${counted}'`,
  }, signal);
  const data = cyclingCounts(state.paths, counts, counted);
  if (!counts.length) data.note = `bicycles: no published counts for ${counted}; no flow simulated`;
  state.requested = requested;
  return state.data = data;
}

export function mobilityLanes(data, mode, extent = mobilityBounds) {
  if (!['bicycle', 'pedestrian'].includes(mode)) throw new Error(`Unknown mobility mode: ${mode}`);
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Invalid mobility GeoJSON');
  const pedestrian = mode === 'pedestrian', flow = pedestrian ? 90 : 60, speed = pedestrian ? 1.4 : 4.2;
  const features = [], seen = new Set(), latest = new Map();
  for (const { properties: p } of data.features) {
    if (!p?.osm_id || !Number.isFinite(Date.parse(p.date_export))) throw new Error('Missing mobility path provenance');
    const date = Date.parse(p.date_export);
    if (!latest.has(p.osm_id) || date > latest.get(p.osm_id)) latest.set(p.osm_id, date);
  }
  for (const feature of data.features) {
    const p = feature.properties;
    if (!p || typeof p.amenagement !== 'string') throw new Error('Missing mobility path classification');
    if (Date.parse(p.date_export) !== latest.get(p.osm_id)) continue;
    if (pedestrian && !sharedPaths.has(p.amenagement)) continue;
    const geometry = feature.geometry;
    if (!['LineString', 'MultiLineString'].includes(geometry?.type)) throw new Error('Invalid mobility path geometry');
    const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
    for (const line of lines) {
      if (!Array.isArray(line) || line.length < 2 || line.some(invalidMobilityCoordinate)) {
        throw new Error('Invalid mobility path coordinates');
      }
      for (const coordinates of clipLine(line, extent)) {
        const forward = JSON.stringify(coordinates), reverse = JSON.stringify(coordinates.slice().reverse());
        const key = forward < reverse ? forward : reverse;
        if (seen.has(key)) continue;
        seen.add(key);
        const description = `Ville de Paris / OpenStreetMap open-data path.\nSimulated positions, not live GPS or measured counts.\n` +
          `Assumed ${speed} m/s and ${flow} ${mode}s/hour per segment. No service hours or direction guarantees.`;
        features.push({
          type: 'Feature', geometry: { type: 'LineString', coordinates },
          properties: { flow, name: p.nom || (pedestrian ? 'Shared footpath' : 'Cycle route'),
            description, osm_id: p.osm_id, amenagement: p.amenagement, source: p.source, date_export: p.date_export },
        });
      }
    }
  }
  return { type: 'FeatureCollection', source: mobilitySource, license: 'ODbL-1.0', bounds: extent,
    note: `simulated on open-data ${pedestrian ? 'pedestrian/shared' : 'cycling'} paths; assumed speed/flow, not measured`,
    features };
}

function invalidMobilityCoordinate(point) {
  return !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) ||
    Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90;
}

export function transitSettings(mode) {
  const settings = transitModes[mode];
  if (!settings) throw new Error(`Unknown transit mode: ${mode}`);
  return settings;
}

function joinLines(lines) {
  const remaining = lines.slice(), result = [];
  while (remaining.length) {
    let current = remaining.pop().slice(), joined = true;
    while (joined) {
      joined = false;
      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        if (samePoint(current.at(-1), next[0])) current.push(...next.slice(1));
        else if (samePoint(current.at(-1), next.at(-1))) current.push(...next.slice(0, -1).reverse());
        else if (samePoint(current[0], next.at(-1))) current = [...next.slice(0, -1), ...current];
        else if (samePoint(current[0], next[0])) current = [...next.slice(1).reverse(), ...current];
        else continue;
        remaining.splice(i, 1);
        joined = true;
        break;
      }
    }
    result.push(current);
  }
  return result;
}

export function transitLanes(data, mode, bounds) {
  const settings = transitSettings(mode);
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Invalid transit GeoJSON');
  }
  const features = [], seen = new Set();
  for (const feature of data.features) {
    const p = feature.properties;
    if (p?.route_type !== settings.type) continue;
    const geometry = feature.geometry;
    if (!p.route_id || !['LineString', 'MultiLineString'].includes(geometry?.type)) {
      throw new Error('Invalid transit route');
    }
    const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
    for (const line of lines) {
      if (!Array.isArray(line) || line.length < 2 || line.some(invalidCoordinate)) {
        throw new Error(`Invalid coordinates for ${p.route_id}`);
      }
    }
    for (const line of joinLines(lines)) {
      for (const coordinates of clipLine(line, bounds)) {
        const key = `${p.route_id}:${JSON.stringify(coordinates)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates },
          properties: {
            ...p,
            flow: settings.flow,
            name: `${settings.type} ${p.route_short_name}`,
            description: `${p.route_long_name || ''}\nIDFM open-data route. Simulated positions, not live.\n` +
              `Assumed ${settings.speed * 3.6} km/h and ${settings.flow} vehicles/hour per route segment.`,
          },
        });
      }
    }
  }
  return {
    type: 'FeatureCollection',
    note: 'simulated on IDFM routes; assumed speed/headway, no live positions',
    features,
  };
}

function invalidCoordinate(point) {
  return !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]);
}

export async function parisTransit(time, layer, signal) {
  signal.throwIfAborted();
  if (transitCache.has(layer)) return transitCache.get(layer);
  const mode = layer.options.transitMode, settings = transitSettings(mode), bounds = trafficBounds(layer);
  const url = new URL('https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-des-lignes-de-transport-en-commun-idfm/exports/geojson');
  url.search = new URLSearchParams({
    select: 'route_id,route_short_name,route_long_name,route_type,route_color,shape',
    where: `${boundsQuery('shape', bounds)} AND route_type = '${settings.type}'`,
  });
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`IDFM ${mode}: HTTP ${response.status}`);
  const data = transitLanes(await response.json(), mode, bounds);
  data.note = `${mode}: no live counts; simulated flow on IDFM routes`;
  signal.throwIfAborted();
  transitCache.set(layer, data);
  return data;
}

/** Fresh open-data requests; callers cache results only for their layer's lifetime. */
export async function parisAPI(dataset, endpoint, query, signal) {
  const url = new URL(`https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/${dataset}/${endpoint}`);
  url.search = new URLSearchParams(query);
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`${dataset}: HTTP ${response.status}`);
  return response.json();
}

export async function parisRecords(dataset, query, signal) {
  const records = [];
  let total;
  do {
    const data = await parisAPI(dataset, 'records', { ...query, limit: 100, offset: records.length }, signal);
    if (!Array.isArray(data.results) || !Number.isSafeInteger(data.total_count) ||
      data.results.length === 0 && records.length < data.total_count) throw new Error(`Invalid records: ${dataset}`);
    total = data.total_count;
    records.push(...data.results);
  } while (records.length < total);
  return records;
}

export function trafficBounds(layer) {
  return layer.options.bounds || [2.26, 48.835, 2.38, 48.885];
}

export function boundsQuery(field, bounds) {
  const [west, south, east, north] = bounds;
  return `intersects(${field},geom'POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))')`;
}

/** Place measured counter flows on the nearest recorded path, never extrapolate to unmeasured paths. */
export function cyclingCounts(paths, counts, counted) {
  const features = [], matched = new Map(), unmatched = [];
  for (const counter of counts) {
    if (!Number.isFinite(counter.sum_counts) || counter.sum_counts < 0 ||
      !Number.isFinite(counter.coordinates?.lon) || !Number.isFinite(counter.coordinates?.lat)) {
      throw new Error('Invalid cycling counter');
    }
    let best = -1, distance = 50;
    for (let i = 0; i < paths.features.length; i++) {
      const line = paths.features[i].geometry.coordinates;
      for (let j = 1; j < line.length; j++) {
        const d = counterDistance(counter.coordinates, line[j - 1], line[j]);
        if (d < distance) { best = i; distance = d; }
      }
    }
    if (best < 0) { unmatched.push(counter.id_compteur); continue; }
    if (!matched.has(best)) matched.set(best, []);
    matched.get(best).push(counter);
  }
  for (const [index, counters] of matched) {
    const path = paths.features[index], flow = counters.reduce(sumCounts, 0);
    features.push({ ...path, properties: { ...path.properties, flow,
      countedAt: counted, counters: counters.map(counterId),
      description: `${flow} bicycles/hour measured at ${counted}.\n` +
        'Counter mapped to the nearest recorded cycling path within 50 m.\nIllustrative positions, not live GPS; no extrapolation to other paths.',
    } });
  }
  return { ...paths, hour: counted, features,
    note: `bicycles: measured counts ${counted}; ${unmatched.length} unmatched counters; unmeasured paths not animated, not live GPS` };
}

function sumCounts(total, counter) {
  return total + counter.sum_counts;
}

function counterId(counter) {
  return counter.id_compteur;
}

function counterDistance(point, a, b) {
  const scale = 111195 * Math.cos(point.lat * Math.PI / 180);
  const ax = (a[0] - point.lon) * scale, ay = (a[1] - point.lat) * 111195;
  const dx = (b[0] - a[0]) * scale, dy = (b[1] - a[1]) * 111195;
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function roadFeature({ geometry, properties: { q, libelle } }) {
  if (!Number.isFinite(q) || q < 0 || !['LineString', 'MultiLineString'].includes(geometry?.type)) {
    throw new Error('Invalid road counter');
  }
  return {
      type: 'Feature', geometry,
      properties: {
        flow: q,
        name: String(libelle || 'Road').replace(/_/g, ' '),
        description: `${Math.round(q)} vehicles/hour (measured)\nIllustrative vehicle, not a live position.`,
      },
  };
}
