import { colliders } from '../weakmaps/colliders.js';

/**
 * Return a mesh's cached collider when its geometry and rotation/scale are unchanged.
 *
 * @param {Object} mesh Mesh containing geometry and a world matrix.
 *
 * @returns {Object|undefined} The valid cached collider, if any.
 */
export function cachedCollider(mesh) {
  const c = colliders.get(mesh), m = mesh.worldMatrix;
  if (!c || c.geometry !== mesh.geometry) return undefined;
  let i;
  for (i = 0; i < 12; i++) {
    if (i % 4 !== 3 && c.matrix[i] !== m[i]) return undefined;
  }
  return c;
}
