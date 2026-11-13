import { coreQuadIndices } from '../globals/coreQuadIndices.js';
import { coreQuadUV } from '../globals/coreQuadUV.js';
import { coreWhite } from '../globals/coreWhite.js';
import { textureFor } from '../textures/nativeTextureFor.js';
import { putNativeMesh } from './putNativeMesh.js';

/**
 * Create or update a textured native mesh from four corners.
 *
 * @param {Object} state Native layer state.
 * @param {string} key Mesh identifier.
 * @param {HTMLImageElement} image Image to use as a texture.
 * @param {Array} corners Quad corner coordinates.
 * @param {number} opacity Mesh opacity.
 *
 * @returns {Object|undefined} Mesh, if the texture is available.
 */
export function quadNativeMesh(state, key, image, corners, opacity) {
  const texture = textureFor(state, key, image);
  if (!texture) return;
  const indices = coreQuadIndices;
  const position = /* alloc */ [];
  const uv = /* alloc */ [];
  let index;
  for (index of indices) {
    position.push(...corners[index]);
    uv.push(coreQuadUV[index * 2], coreQuadUV[index * 2 + 1]);
  }
  return putNativeMesh(state, key, position, coreWhite, opacity, texture, uv);
}
