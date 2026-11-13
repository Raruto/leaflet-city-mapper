import { compareMeshDepth } from './compareMeshDepth.js';

/**
 * Sort ground first, then opaque and transparent meshes with their depth ordering.
 *
 * @param {Object} a First mesh.
 * @param {Object} b Second mesh.
 *
 * @returns {number} Sort comparison.
 */
export function compareMeshes(a, b) {
  return Number(Boolean(b.ground)) - Number(Boolean(a.ground)) ||
    (a.ground && b.ground ? (a.renderOrder || 0) - (b.renderOrder || 0) ||
      a.tile.coords.z - b.tile.coords.z : 0) ||
    Number(a.program.transparent) - Number(b.program.transparent) ||
    compareMeshDepth(a, b);
}
