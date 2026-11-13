/**
 * Local-space normal of the box face a ray hits, or the nearest face when the origin is inside.
 *
 * @param {number} entry Ray parameter where the box is entered.
 * @param {boolean} xFirst Whether the x slab is entered after the z slab.
 * @param {number} ox Local ray origin x.
 * @param {number} oz Local ray origin z.
 * @param {number} ux Local ray direction x.
 * @param {number} uz Local ray direction z.
 * @param {Object} bounds Local vehicle bounds.
 * @param {number} margin Padding added around the bounds.
 * @param {number[]} out Receives the normal x and z.
 */
export function boxNormal(entry, xFirst, ox, oz, ux, uz, bounds, margin, out) {
  if (entry >= 0) {
    out[0] = xFirst ? -Math.sign(ux) : 0;
    out[1] = xFirst ? 0 : -Math.sign(uz);
    return;
  }
  let nearest = ox - (bounds.minX - margin);
  out[0] = -1; out[1] = 0;
  if (bounds.maxX + margin - ox < nearest) {
    nearest = bounds.maxX + margin - ox; out[0] = 1;
  }
  if (oz - (bounds.minZ - margin) < nearest) {
    nearest = oz - (bounds.minZ - margin); out[0] = 0; out[1] = -1;
  }
  if (bounds.maxZ + margin - oz < nearest) { out[0] = 0; out[1] = 1; }
}
