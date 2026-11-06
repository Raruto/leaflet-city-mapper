import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';

export function pruneNativeResources(state) {
  const { meshes, textures, backend } = state;
  let mesh, texture, key;
  for ([key, mesh] of meshes) {
    if (mesh._nativeUsed) continue;
    disposeMesh(backend, mesh);
    meshes.delete(key);
    texture = textures.get(key);
    if (texture) destroyTexture(backend, texture.texture);
    textures.delete(key);
  }
  for ([key, texture] of textures) {
    if (texture.used) continue;
    destroyTexture(backend, texture.texture);
    textures.delete(key);
  }
}
