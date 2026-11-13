/**
 * Whether a ray parallel to a slab starts outside it.
 *
 * @param {number} origin Ray origin on the axis.
 * @param {number} velocity Ray direction on the axis.
 * @param {number} min Slab minimum.
 * @param {number} max Slab maximum.
 * @param {number} margin Padding added around the slab.
 *
 * @returns {boolean} True when the ray can never enter the slab.
 */
export function slabMiss(origin, velocity, min, max, margin) {
  return !velocity && (origin <= min - margin || origin >= max + margin);
}
