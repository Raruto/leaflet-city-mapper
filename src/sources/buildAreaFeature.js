import { parseColor } from '../colors/parseColor.js';
import { featureAnchor } from './featureAnchor.js';
import { extrusionStyle } from './extrusionStyle.js';
import { prepareAreaGeometryJob } from './prepareAreaGeometryJob.js';
import { matchesAreaTile } from './matchesAreaTile.js';

/**
 * Queue geometry and picking metadata for a styled feature belonging to the current source area.
 *
 * @param {Object} context Area build context.
 * @param {Object} feature GeoJSON feature to process.
 */
export function buildAreaFeature(context, feature) {
  const { backend: layer, area, map } = context;
  const coords = area.coords;
  const coordinates = featureAnchor(feature, layer.options.nightLight);
  const geometry = feature.geometry;
  const lon = coordinates[0], lat = coordinates[1];
  if (!matchesAreaTile(map, coords, lon, lat)) return;
  const style = extrusionStyle(layer, feature);
  if (style === null) {
    context.skipped++;
    return;
  }
  const { color = 0xd9b38c } = style;
  const baseColor = parseColor(color);
  prepareAreaGeometryJob(context, feature, lon, lat, style, baseColor);
  context.featureFaces.push(/* alloc */ {
    id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
    properties: feature.properties, baseColor, polygon: geometry.type === 'Polygon' || geometry.type === 'MultiPolygon',
  });
}
