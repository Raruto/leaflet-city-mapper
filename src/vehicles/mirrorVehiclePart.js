import { box } from "../geometry/box.js";

/**
 * Create a pair of extrusion parts mirrored across the vehicle's longitudinal axis.
 *
 * @param {number} x0 Inner lateral bound.
 * @param {number} x1 Outer lateral bound.
 * @param {number} z0 First longitudinal bound.
 * @param {number} z1 Second longitudinal bound.
 * @param {...*} rest Remaining extrusion-part fields.
 *
 * @returns {Array} The two mirrored parts.
 */
export function mirror(x0, x1, z0, z1, ...rest) {
  return /* alloc */ [
    /* alloc */ [box(x0, x1, z0, z1), ...rest],
    /* alloc */ [box(-x1, -x0, z0, z1), ...rest]
  ];
}
