// GeoJSON (Multi)LineStrings become lanes ({latlngs, properties, elevation?}); prepare() adds `points` ([x, z, ground]),
// `lengths` and `length` in layer-local metres.

export function toLanes({ features = [] }) {
  const lanes = [];
  let geometry, properties, lines, line, latlngs, lng, lat;
  for ({ geometry, properties } of features) {
    lines = geometry?.type === 'LineString' ? [geometry.coordinates] : geometry?.type === 'MultiLineString' ? geometry.coordinates : [];
    for (line of lines) {
      latlngs = [];
      for ([lng, lat] of line) latlngs.push([lat, lng]);
      lanes.push({ latlngs, properties: properties ?? {}, elevation: properties?.elevation });
    }
  }
  return lanes;
}
