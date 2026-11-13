/**
 * Distance along one axis to a slab boundary, picking the boundary the ray moves toward.
 *
 * @param {number} origin Ray origin on the axis.
 * @param {number} velocity Ray direction on the axis.
 * @param {number} low Boundary hit when moving in the positive direction.
 * @param {number} high Boundary hit when moving in the negative direction.
 * @param {number} parallel Value returned when the ray is parallel to the slab.
 *
 * @returns {number} Ray parameter at the selected boundary.
 */
export function slabDistance(origin, velocity, low, high, parallel) {
  return velocity ? ((velocity > 0 ? low : high) - origin) / velocity : parallel;
}
