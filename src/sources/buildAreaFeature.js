import { buildAreaPoint } from './buildAreaPoint.js';
import { buildAreaPolygon } from './buildAreaPolygon.js';
import { parseColor } from '../utils/parseColor.js';

export function buildAreaFeature(context, feature) {
  const { backend, area, map } = context;
  const coords = area.coords;
  const geometry = feature?.geometry;
  const isTree = geometry?.type === 'Point';
  if (backend.options.nightLight && !isTree) throw new Error('Night lights require Point geometry');
  const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] :
    geometry?.type === 'MultiPolygon' ? geometry.coordinates : null;
  if (!polygons && !isTree) throw new Error('Unsupported GeoJSON geometry');
  const [lon, lat] = (isTree ? geometry.coordinates : polygons[0]?.[0]?.[0]) ?? [];
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error('Invalid GeoJSON coordinates');
  if (coords) {
    const anchor = map.project(new L.LatLng(lat, lon), coords.z);
    if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) return;
  }
  const style = backend.options.style(feature);
  if (style === null) {
    context.skipped++;
    return;
  }
  if (!style || typeof style !== 'object') throw new Error('style must return an extrusion style or null');
  const { top, bottom = 0, color = 0xd9b38c } = style;
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
    throw new Error('Invalid extrusion heights: expected top > bottom >= 0');
  }
  const baseColor = parseColor(color);
  const vertexStart = context.positions.length / 3;
  if (isTree) buildAreaPoint(context, feature, lon, lat, style, baseColor);
  let rings;
  for (rings of polygons || []) buildAreaPolygon(context, rings, top, bottom, baseColor);
  const vertexEnd = context.positions.length / 3;
  context.featureFaces.push({
    id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
    properties: feature.properties, baseColor,
    faceStart: vertexStart / 3, faceEnd: vertexEnd / 3, vertexStart, vertexEnd,
  });
}
