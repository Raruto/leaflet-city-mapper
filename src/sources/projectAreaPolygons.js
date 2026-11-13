import { projectRing } from '../projections/projectRing.js';

/**
 * Project every ring of a polygon or multipolygon into the area coordinate system.
 *
 * @param {Object} context Area projection context.
 * @param {Object} geometry GeoJSON geometry.
 *
 * @returns {Array} Projected polygons, or an empty array for other geometry types.
 *
 * @throws {Error} If a polygon contains no rings.
 */
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
