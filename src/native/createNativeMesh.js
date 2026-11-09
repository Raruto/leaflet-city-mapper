import { L } from '../globals/L.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { createMesh } from '../rendering/createMesh.js';
import { nativeProgram } from './nativeProgram.js';

export function createNativeMesh(state, key, position, color, opacity, texture, uv, terrain, nativeStroke) {
  const { backend: layer, source, meshes } = state;
  // Unlit, noninteractive strokes use the normal slot for stationary anchors.
  const normal = nativeStroke ? state.strokeAnchors : /* alloc */ [];
  let index, mesh = meshes.get(key);
  if (!nativeStroke) {
    for (index = 0; index < position.length; index++) normal.push(index % 3 === 1 ? 1 : 0);
  }
  const data = /* alloc */ { position, normal };
  if (uv) data.uv = uv;
  const material = /* alloc */ {
    vertexColors: false, color, opacity, unlit: true, alphaMode: 'BLEND', depthWrite: terrain, nativeStroke,
  };
  if (texture) material.baseTexture = texture;
  if (mesh) disposeMesh(layer, mesh);
  mesh = createMesh(layer, data, material, 0, source instanceof L.GridLayer
    ? (terrain ? state.terrainRasterProgram : state.rasterProgram) || nativeProgram(layer, material)
    : nativeProgram(layer, material));
  if (source instanceof L.GridLayer) {
    if (terrain) state.terrainRasterProgram ||= mesh.program;
    else state.rasterProgram ||= mesh.program;
    mesh.texture = texture;
  }
  meshes.set(key, mesh);
  return mesh;
}
