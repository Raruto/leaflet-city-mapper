/**
 * Create the four corners of an axis-aligned x/z rectangle.
 *
 * @param {number} x0 Minimum x.
 * @param {number} x1 Maximum x.
 * @param {number} z0 Minimum z.
 * @param {number} z1 Maximum z.
 *
 * @returns {Array<Array<number>>} Rectangle corners.
 */
export function box(x0, x1, z0, z1) {
  return /* alloc */ [
    /* alloc */ [x0, z0],
    /* alloc */ [x1, z0],
    /* alloc */ [x1, z1],
    /* alloc */ [x0, z1],
  ];
}
