/**
 * Express a world-space walker ray in a traffic vehicle's local frame.
 *
 * @param {Object} root Traffic root with position and scale arrays.
 * @param {Object} position Vehicle placement with dx and dz heading components.
 * @param {number} x Walker world-space x coordinate.
 * @param {number} z Walker world-space z coordinate.
 * @param {number} dx Movement direction x.
 * @param {number} dz Movement direction z.
 * @param {number} px Vehicle x in root space.
 * @param {number} pz Vehicle z in root space.
 * @param {number[]} out Receives the local origin x, origin z, direction x and direction z.
 */
export function trafficRay(root, position, x, z, dx, dz, px, pz, out) {
  const rx = (x - root.position[0]) / root.scale[0] - px;
  const rz = (z - root.position[2]) / root.scale[2] - pz;
  out[0] = -rx * position.dz + rz * position.dx;
  out[1] = -rx * position.dx - rz * position.dz;
  out[2] = -dx / root.scale[0] * position.dz + dz / root.scale[2] * position.dx;
  out[3] = -dx / root.scale[0] * position.dx - dz / root.scale[2] * position.dz;
}
