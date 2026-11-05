import { disposeMesh } from '../rendering/disposeMesh.js';
import { createMesh } from '../rendering/createMesh.js';
import { styleNativeMesh } from './styleNativeMesh.js';

export function putNativeMesh(state, key, position, color, opacity, texture, uv) {
  const { backend, source, meshes } = state;
  if (!position.length) return;
  let mesh = meshes.get(key);
  const normal = [];
  let index;
  for (index = 0; index < position.length; index++) normal.push(index % 3 === 1 ? 1 : 0);
  const data = { position, normal, ...(uv ? { uv } : {}) };
  if (!mesh || mesh.geometry.attributes.position.data.length !== position.length ||
    mesh.program.uniforms.baseTexture?.value !== texture) {
    if (mesh) disposeMesh(backend, mesh);
    mesh = createMesh(backend, data, {
      vertexColors: false, color, opacity, unlit: true, alphaMode: 'BLEND',
      ...(texture ? { baseTexture: texture } : {}),
    }, 0, source instanceof L.GridLayer ? state.rasterProgram : undefined);
    if (source instanceof L.GridLayer) {
      state.rasterProgram ||= mesh.program;
      mesh.texture = texture;
    }
    meshes.set(key, mesh);
  } else {
    const attribute = mesh.geometry.attributes.position;
    attribute.data.set(position);
    attribute.needsUpdate = true;
    mesh.geometry.bounds = null;
  }
  styleNativeMesh(state, mesh, color, opacity);
  return mesh;
}
