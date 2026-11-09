import { projectRing } from '../projections/projectRing.js';

export function projectAreaPolygons(context, geometry) {
  const rings = geometry.type === 'Polygon' ? /* alloc */ [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : /* alloc */ [];
  const polygons = /* alloc */ [];
  let polygon, ring, paths;
  for (polygon of rings) {
    if (!polygon.length) throw /* alloc */ new Error('Empty GeoJSON polygon');
    paths = /* alloc */ [];
    for (ring of polygon) paths.push(projectRing(context, ring));
    polygons.push(paths);
  }
  return polygons;
}
