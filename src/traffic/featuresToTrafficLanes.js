import { trafficEmptyList } from '../globals/trafficEmptyList.js';

// GeoJSON (Multi)LineStrings become lanes ({latlngs, properties, elevation?}); prepare() adds `points` ([x, z, ground]),
// `lengths` and `length` in layer-local metres.



/**
 * Convert GeoJSON line and multiline features to lanes, preserving their properties and elevation.
 *
 * @param {Object} collection GeoJSON feature collection.
 *
 * @returns {Array} Lanes with latitude-longitude points and feature properties.
 */
export function toLanes({ features = trafficEmptyList }) {
  const lanes = /* alloc */ [];
  let geometry, properties, lines, line, latlngs, lng, lat, i;
  for ({ geometry, properties } of features) {
    if (geometry?.type !== 'LineString' && geometry?.type !== 'MultiLineString') continue;
    lines = geometry.type === 'MultiLineString' ? geometry.coordinates : null;
    for (i = 0; i < (lines ? lines.length : 1); i++) {
      line = lines ? lines[i] : geometry.coordinates;
      latlngs = /* alloc */ [];
      for ([lng, lat] of line) latlngs.push(/* alloc */ [lat, lng]);
      lanes.push(/* alloc */ {
        latlngs, properties: properties ?? /* alloc */ {},
        elevation: properties?.elevation,
      });
    }
  }
  return lanes;
}
