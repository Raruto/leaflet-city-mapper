// Convert the Paris open-data network into cycling/shared-footpath archive payloads.
import { clipLine } from '../../src/geometry/clipLine.js';

const source = 'https://opendata.paris.fr/explore/dataset/amenagements-cyclables/';
const bounds = [2.26, 48.835, 2.38, 48.885];
const sharedPaths = new Set(['voie pi\u00e9tonne', 'voie verte', 'chemin ferm\u00e9 \u00e0 la circulation g\u00e9n\u00e9rale (bois)']);

export function mobilityLanes(data, mode, extent = bounds) {
  if (!['bicycle', 'pedestrian'].includes(mode)) throw new Error(`Unknown mobility mode: ${mode}`);
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Invalid mobility GeoJSON');
  const pedestrian = mode === 'pedestrian', flow = pedestrian ? 90 : 60, speed = pedestrian ? 1.4 : 4.2;
  const features = [], seen = new Set();
  const latest = new Map();
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
      if (!Array.isArray(line) || line.length < 2 || line.some(invalidCoordinate)) throw new Error('Invalid mobility path coordinates');
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
  return { type: 'FeatureCollection', source, license: 'ODbL-1.0', bounds: extent,
    note: `simulated on open-data ${pedestrian ? 'pedestrian/shared' : 'cycling'} paths; assumed speed/flow, not measured`,
    features };
}

function invalidCoordinate(point) {
  return !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) ||
    Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90;
}
