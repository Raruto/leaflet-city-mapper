export function featureAnchor(feature, nightLight) {
  const geometry = feature?.geometry, point = geometry?.type === 'Point';
  if (nightLight && !point) throw /* alloc */ new Error('Night lights require Point geometry');
  if (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon' && !point) throw /* alloc */ new Error('Unsupported GeoJSON geometry');
  const coordinates = point ? geometry.coordinates :
    geometry.type === 'Polygon' ? geometry.coordinates[0]?.[0] : geometry.coordinates[0]?.[0]?.[0];
  if (!Number.isFinite(coordinates?.[0]) || !Number.isFinite(coordinates?.[1])) throw /* alloc */ new Error('Invalid GeoJSON coordinates');
  return coordinates;
}
