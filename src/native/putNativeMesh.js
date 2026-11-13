import { L } from '../globals/L.js';
import { styleNativeMesh } from './styleNativeMesh.js';
import { createNativeMesh } from './createNativeMesh.js';
import { updateNativeStrokeRadius } from './updateNativeStrokeRadius.js';

/**
 * Create or update a native mesh and apply its style.
 *
 * @param {Object} state Native layer state.
 * @param {string} key Mesh identifier.
 * @param {Array} position Vertex coordinates.
 * @param {number|Array} color Material color.
 * @param {number} opacity Material opacity.
 * @param {Object} texture Optional base texture.
 * @param {Array} uv Optional texture coordinates.
 * @param {boolean} terrain Whether the mesh represents terrain.
 *
 * @returns {Object|undefined} Updated mesh, if positions were provided.
 */
export function putNativeMesh(state, key, position, color, opacity, texture, uv, terrain = false) {
  const { source, meshes } = state;
  if (!position.length) return;
  const nativeStroke = key === 'stroke' && Boolean(state.strokeCoordinates) && source.options.interactive === false;
  let mesh = meshes.get(key);
  if (!mesh || mesh.geometry.attributes.position.data.length !== position.length ||
    (source instanceof L.GridLayer && mesh.program.depthWrite !== terrain) ||
    mesh.program.uniforms.baseTexture?.value !== texture ||
    Boolean(mesh.program._layerMaterial.nativeStroke) !== nativeStroke) {
    mesh = createNativeMesh(state, key, position, color, opacity, texture, uv, terrain, nativeStroke);
  } else {
    const attribute = mesh.geometry.attributes.position;
    attribute.data.set(position);
    attribute.needsUpdate = true;
    mesh.geometry.bounds = null;
    if (nativeStroke) {
      mesh.geometry.attributes.normal.data.set(state.strokeAnchors);
      mesh.geometry.attributes.normal.needsUpdate = true;
    }
  }
  if (nativeStroke) updateNativeStrokeRadius(mesh);
  if (mesh.program.uniforms.strokeScale) mesh.program.uniforms.strokeScale.value = 1;
  styleNativeMesh(state, mesh, color, opacity);
  return mesh;
}
