/**
 * IDFM route geometry (ODbL), with illustrative constant speeds and headways.
 * Not GTFS schedules, service availability, stop dwell times or live vehicle locations.
 * Subway trains are intentionally displayed on the surface.
 */
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

// Clip each segment, rather than filtering vertices and connecting disconnected pieces.
function clipSegment(a, b, bounds) {
  const [west, south, east, north] = bounds;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy], q = [a[0] - west, east - a[0], a[1] - south, north - a[1]];
  let start = 0, end = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) start = Math.max(start, t);
      else end = Math.min(end, t);
      if (start > end) return null;
    }
  }
  if (start === end || dx === 0 && dy === 0) return null;
  return [[a[0] + start * dx, a[1] + start * dy], [a[0] + end * dx, a[1] + end * dy]];
}

function samePoint(a, b) {
  return Math.abs(a[0] - b[0]) < 1e-10 && Math.abs(a[1] - b[1]) < 1e-10;
}

function clipLine(line, bounds) {
  const pieces = [];
  let current;
  for (let i = 1; i < line.length; i++) {
    if (samePoint(line[i - 1], line[i])) continue;
    const segment = clipSegment(line[i - 1], line[i], bounds);
    if (!segment) {
      current = null;
      continue;
    }
    if (current && samePoint(current.at(-1), segment[0])) current.push(segment[1]);
    else {
      current = segment;
      pieces.push(current);
    }
  }
  return pieces;
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
              `Assumed ${settings.speed * 3.6} km/h and ${settings.flow} vehicles/hour per route segment.` +
              (mode === 'metro' ? '\nSubway shown on the surface for visibility.' : ''),
          },
        });
      }
    }
  }
  return {
    type: 'FeatureCollection',
    note: 'simulated on IDFM routes; assumed speed/headway, no live positions' +
      (mode === 'metro' ? '; subway shown on surface' : ''),
    features,
  };
}

function invalidCoordinate(point) {
  return !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]);
}

export default async function parisTransit(time, layer, signal) {
  signal.throwIfAborted();
  if (cache.has(layer)) return cache.get(layer);
  const mode = layer.options.transitMode, settings = transitSettings(mode);
  const url = new URL(`paris-${settings.archive}.pmtiles`, import.meta.url).href;
  const archive = new L.Layer({ source: { type: 'pmtiles', url } });
  await archive.ready;
  signal.throwIfAborted();
  const h = archive.header;
  const point = layer._map.project([h.centerLat, h.centerLon], h.maxZoom).divideBy(256).floor();
  const tile = await archive.getZxy(h.maxZoom, point.x, point.y, signal);
  if (!tile) throw new Error(`Missing ${mode} transit archive tile`);
  const data = transitLanes(JSON.parse(new TextDecoder().decode(tile.data)), mode,
    [h.minLon, h.minLat, h.maxLon, h.maxLat]);
  signal.throwIfAborted();
  cache.set(layer, data);
  return data;
}
