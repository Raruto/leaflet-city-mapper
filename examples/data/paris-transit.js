/**
 * IDFM route geometry (ODbL), with illustrative constant speeds and headways.
 * Not GTFS schedules, service availability, stop dwell times or live vehicle locations.
 * Subway trains are intentionally displayed on the surface.
 */
import { clipLine, samePoint } from '../../src/geometry/clipLine.js';
import { boundsQuery, trafficBounds } from './paris-api.js';

const modes = {
  bus: { archive: 'bus-tram', type: 'Bus', speed: 5, flow: 12 },
  tram: { archive: 'bus-tram', type: 'Tram', speed: 7, flow: 15 },
  metro: { archive: 'metro', type: 'Subway', speed: 10, flow: 24 },
};
const cache = new WeakMap();

export function transitSettings(mode) {
  const settings = modes[mode];
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

export default async function parisTransit(time, layer, signal) {
  signal.throwIfAborted();
  if (cache.has(layer)) return cache.get(layer);
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
  cache.set(layer, data);
  return data;
}
