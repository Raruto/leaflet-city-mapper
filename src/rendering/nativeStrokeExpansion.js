/**
 * Calculate the extra local-space culling radius needed for a scaled native stroke.
 *
 * @param {Object} mesh Mesh containing stroke uniforms and geometry.
 *
 * @returns {number} Additional bounding radius.
 */
export function nativeStrokeExpansion(mesh) {
  const strokeScale = mesh.program?.uniforms?.strokeScale?.value ?? 1;
  return Math.max(0, strokeScale - 1) * (mesh.geometry.nativeStrokeRadius || 0);
}
