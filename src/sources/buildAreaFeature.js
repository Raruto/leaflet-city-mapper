import { L } from '../globals/L.js';
import { buildAreaPoint } from './buildAreaPoint.js';
import { buildAreaPolygon } from './buildAreaPolygon.js';
import { parseColor } from '../utils/parseColor.js';

export function buildAreaFeature(context, feature) {
  const { backend, area, map } = context;
  const coords = area.coords;
  const geometry = feature?.geometry;
  const isTree = geometry?.type === 'Point';
  if (backend.options.nightLight && !isTree) throw /* alloc */ new Error('Night lights require Point geometry');
  if (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon' && !isTree) throw /* alloc */ new Error('Unsupported GeoJSON geometry');
  const coordinates = isTree ? geometry.coordinates :
    geometry.type === 'Polygon' ? geometry.coordinates[0]?.[0] : geometry.coordinates[0]?.[0]?.[0];
  if (!Number.isFinite(coordinates?.[0]) || !Number.isFinite(coordinates?.[1])) throw /* alloc */ new Error('Invalid GeoJSON coordinates');
  const lon = coordinates[0], lat = coordinates[1];
  if (coords) {
    const anchor = map.project(/* alloc */ new L.LatLng(lat, lon), coords.z);
    if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) return;
  }
  const style = backend.options.style(feature);
  if (style === null) {
    context.skipped++;
    return;
  }
  if (!style || typeof style !== 'object') throw /* alloc */ new Error('style must return an extrusion style or null');
  const { top, bottom = 0, color = 0xd9b38c } = style;
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
    throw /* alloc */ new Error('Invalid extrusion heights: expected top > bottom >= 0');
  }
  const baseColor = parseColor(color);
  const vertexStart = context.positions.length / 3;
  if (isTree) buildAreaPoint(context, feature, lon, lat, style, baseColor);
  let polygon;
  if (geometry.type === 'Polygon') buildAreaPolygon(context, geometry.coordinates, top, bottom, baseColor);
  else if (geometry.type === 'MultiPolygon') for (polygon of geometry.coordinates) buildAreaPolygon(context, polygon, top, bottom, baseColor);
  const vertexEnd = context.positions.length / 3;
  context.featureFaces.push(/* alloc */ {
    id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
    properties: feature.properties, baseColor,
    faceStart: vertexStart / 3, faceEnd: vertexEnd / 3, vertexStart, vertexEnd,
  });
}
