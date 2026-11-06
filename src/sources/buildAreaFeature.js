import { L } from '../globals/L.js';
import { buildAreaPoint } from './buildAreaPoint.js';
import { buildAreaPolygon } from './buildAreaPolygon.js';
import { parseColor } from '../utils/parseColor.js';
import { featureAnchor } from './featureAnchor.js';
import { extrusionStyle } from './extrusionStyle.js';

export function buildAreaFeature(context, feature) {
  const { backend: layer, area, map } = context;
  const coords = area.coords;
  const coordinates = featureAnchor(feature, layer.options.nightLight);
  const geometry = feature.geometry, isTree = geometry.type === 'Point';
  const lon = coordinates[0], lat = coordinates[1];
  if (coords) {
    const anchor = map.project(/* alloc */ new L.LatLng(lat, lon), coords.z);
    if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) return;
  }
  const style = extrusionStyle(layer, feature);
  if (style === null) {
    context.skipped++;
    return;
  }
  const { top, bottom = 0, color = 0xd9b38c } = style;
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
