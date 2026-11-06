import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../textures/destroyTexture.js';

export function pruneNativeResources(state) {
  const { meshes, textures, backend: layer } = state;
  let mesh, texture, key;
  for ([key, mesh] of meshes) {
    if (mesh._nativeUsed) continue;
    disposeMesh(layer, mesh);
    meshes.delete(key);
    texture = textures.get(key);
    if (texture) destroyTexture(layer, texture.texture);
    textures.delete(key);
  }
  for ([key, texture] of textures) {
    if (texture.used) continue;
    destroyTexture(layer, texture.texture);
    textures.delete(key);
  }
}
