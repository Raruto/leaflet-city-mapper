// GeoJSON (Multi)LineStrings become lanes ({latlngs, properties, elevation?}); prepare() adds `points` ([x, z, ground]),
// `lengths` and `length` in layer-local metres.

export function toLanes({ features = [] }) {
  const lanes = [];
  for (const { geometry, properties } of features) {
    const lines = geometry?.type === 'LineString' ? [geometry.coordinates] : geometry?.type === 'MultiLineString' ? geometry.coordinates : [];
    for (const line of lines) {
      const latlngs = [];
      for (const [lng, lat] of line) latlngs.push([lat, lng]);
      lanes.push({ latlngs, properties: properties ?? {}, elevation: properties?.elevation });
    }
  }
  return lanes;
}
