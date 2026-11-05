import { coreQuadIndices } from '../globals/coreQuadIndices.js';
import { coreQuadUV } from '../globals/coreQuadUV.js';
import { coreWhite } from '../globals/coreWhite.js';
import { textureFor } from './textureFor.js';
import { putNativeMesh } from './putNativeMesh.js';


export function quadNativeMesh(state, key, image, corners, opacity) {
  const texture = textureFor(state, key, image);
  if (!texture) return;
  const indices = coreQuadIndices;
  const position = /* allocation: required -- The native mesh retains these vertex coordinates. */ [];
  const uv = /* allocation: required -- The native mesh retains these texture coordinates. */ [];
  let index;
  for (index of indices) {
    position.push(...corners[index]);
    uv.push(coreQuadUV[index * 2], coreQuadUV[index * 2 + 1]);
  }
  return putNativeMesh(state, key, position, coreWhite, opacity, texture, uv);
}
