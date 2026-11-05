import { textureFor } from './textureFor.js';
import { putNativeMesh } from './putNativeMesh.js';

export function quadNativeMesh(state, key, image, corners, opacity) {
  const texture = textureFor(state, key, image);
  if (!texture) return;
  const indices = [0, 2, 1, 1, 2, 3];
  const position = [], uv = [], textureCoords = [[0, 0], [1, 0], [0, 1], [1, 1]];
  let index;
  for (index of indices) {
    position.push(...corners[index]);
    uv.push(...textureCoords[index]);
  }
  return putNativeMesh(state, key, position, [1, 1, 1], opacity, texture, uv);
}
