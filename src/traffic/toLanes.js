import { trafficEmptyList } from '../globals/trafficEmptyList.js';
// GeoJSON (Multi)LineStrings become lanes ({latlngs, properties, elevation?}); prepare() adds `points` ([x, z, ground]),
// `lengths` and `length` in layer-local metres.



export function toLanes({ features = trafficEmptyList }) {
  const lanes = /* allocation: required -- The caller retains independent lanes for its source. */ [];
  let geometry, properties, lines, line, latlngs, lng, lat, i;
  for ({ geometry, properties } of features) {
    if (geometry?.type !== 'LineString' && geometry?.type !== 'MultiLineString') continue;
    lines = geometry.type === 'MultiLineString' ? geometry.coordinates : null;
    for (i = 0; i < (lines ? lines.length : 1); i++) {
      line = lines ? lines[i] : geometry.coordinates;
      latlngs = /* allocation: required -- Each lane retains an independent coordinate sequence. */ [];
      for ([lng, lat] of line) latlngs.push(/* allocation: required -- Lane coordinates must not alias each other or the source GeoJSON. */ [lat, lng]);
      lanes.push(/* allocation: required -- Each lane owns its preparation and scheduling fields. */ {
        latlngs, properties: properties ?? /* allocation: required -- Missing feature properties must be mutable independently per lane. */ {},
        elevation: properties?.elevation,
      });
    }
  }
  return lanes;
}
