import { uploadMeshTexture } from './uploadMeshTexture.js';
import { bindMeshTextures } from './bindMeshTextures.js';

/**
 * Upload a mesh's program textures and rebuild its bind group when bindings change.
 *
 * @param {Object} renderer Renderer providing the GPU device and uniform buffer.
 * @param {Object} mesh Mesh whose textures and bindings are prepared.
 *
 * @throws {Error} If a required program texture is missing.
 */
export function prepareMeshTextures(renderer, mesh) {
  const { program } = mesh;
  const { device } = renderer;
  const textures = mesh._textures ||= /* alloc */ [];
  textures.length = 0;
  let binding, texture, i;
  for (binding of program.bindings) {
    texture = program.uniforms[binding.name]?.value;
    if (!texture) throw /* alloc */ new Error(`Missing Layer3D texture: ${binding.name}`);
    uploadMeshTexture(device, texture);
    textures.push(texture);
  }
  let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer ||
    textures.length !== mesh.boundTextures.length;
  for (i = 0; !bindingsChanged && i < textures.length; i++) {
    if (textures[i].texture !== mesh.boundTextures[i][0] ||
      textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
  }
  if (bindingsChanged) bindMeshTextures(renderer, mesh, textures);
}
