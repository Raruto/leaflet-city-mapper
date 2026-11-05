import { textureFor } from './textureFor.js';
import { putNativeMesh } from './putNativeMesh.js';
import { state as sharedState } from '../state.js';

export function quadNativeMesh(state, key, image, corners, opacity) {
  const texture = textureFor(state, key, image);
  if (!texture) return;
  const indices = sharedState.allocationCoreQuadIndices;
  const position = /* allocation: required -- The native mesh retains these vertex coordinates. */ [];
  const uv = /* allocation: required -- The native mesh retains these texture coordinates. */ [];
  let index;
  for (index of indices) {
    position.push(...corners[index]);
    uv.push(sharedState.allocationCoreQuadUV[index * 2], sharedState.allocationCoreQuadUV[index * 2 + 1]);
  }
  return putNativeMesh(state, key, position, sharedState.allocationCoreWhite, opacity, texture, uv);
}
