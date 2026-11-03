// GeoJSON (Multi)LineStrings become lanes ({latlngs, properties, elevation?}); prepare() adds `points` ([x, z, ground]),
// `lengths` and `length` in layer-local metres.

export const toLanes = ({ features = [] }) => features.flatMap(({ geometry, properties }) => {
  const lines = geometry?.type === 'LineString' ? [geometry.coordinates] : geometry?.type === 'MultiLineString' ? geometry.coordinates : [];
  return lines.map(line => ({ latlngs: line.map(([lng, lat]) => [lat, lng]), properties: properties ?? {}, elevation: properties?.elevation }));
});
