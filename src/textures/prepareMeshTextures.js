import { uploadMeshTexture } from './uploadMeshTexture.js';
import { bindMeshTextures } from './bindMeshTextures.js';

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
