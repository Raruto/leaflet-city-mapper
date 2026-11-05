import { meshImage } from '../globals/meshImage.js';
import { meshTarget } from '../globals/meshTarget.js';
import { meshCopySize } from '../globals/meshCopySize.js';
import { meshBindGroup } from '../globals/meshBindGroup.js';
import { drawEntries } from '../globals/drawEntries.js';
import { drawMeshEntry } from '../globals/drawMeshEntry.js';
import { drawFrameEntry } from '../globals/drawFrameEntry.js';
import { drawTerrainEntry } from '../globals/drawTerrainEntry.js';
import { drawTextureEntries } from '../globals/drawTextureEntries.js';
import { drawSamplerEntries } from '../globals/drawSamplerEntries.js';

export function prepareMeshTextures(renderer, mesh) {
  const { program } = mesh;
  const { device } = renderer;
  const textures = mesh._textures ||= /* alloc */ [];
  textures.length = 0;
  let binding, texture, i;
  for (binding of program.bindings) {
    texture = program.uniforms[binding.name]?.value;
    if (!texture) throw /* alloc */ new Error(`Missing Layer3D texture: ${binding.name}`);
    if (texture.uploaded !== texture.image) {
      device.queue.copyExternalImageToTexture(
        (
          meshImage.source = texture.image,
          meshImage.flipY = Boolean(texture.flipY),
          meshImage
        ),
        (
          meshTarget.texture = texture.texture,
          meshTarget
        ),
        (
          meshCopySize[0] = texture.image.width,
          meshCopySize[1] = texture.image.height,
          meshCopySize
        )
      );
      meshImage.source = null;
      meshTarget.texture = null;
      texture.uploaded = texture.image;
    }
    textures.push(texture);
  }
  let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer ||
    textures.length !== mesh.boundTextures.length;
  for (i = 0; !bindingsChanged && i < textures.length; i++) {
    if (textures[i].texture !== mesh.boundTextures[i][0] ||
      textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
  }
  if (bindingsChanged) {
    const entries = drawEntries;
    entries.length = 0;
    drawMeshEntry.resource.buffer = renderer.uniformBuffer;
    drawFrameEntry.resource.buffer = renderer.uniformBuffer;
    entries.push(drawMeshEntry, drawFrameEntry);
    if (program.terrain) {
      drawTerrainEntry.resource = program.terrain.texture.createView();
      entries.push(drawTerrainEntry);
    }
    mesh.boundBuffer = renderer.uniformBuffer;
    const boundTextures = mesh.boundTextures ||= /* alloc */ [];
    boundTextures.length = textures.length;
    for (i = 0; i < textures.length; i++) {
      binding = program.bindings[i], texture = textures[i];
      drawTextureEntries[i].binding = binding.texture;
      drawTextureEntries[i].resource = texture.texture.createView();
      drawSamplerEntries[i].binding = binding.sampler;
      drawSamplerEntries[i].resource = texture.sampler;
      entries.push(drawTextureEntries[i], drawSamplerEntries[i]);
      boundTextures[i] ||= /* alloc */ [];
      boundTextures[i][0] = texture.texture;
      boundTextures[i][1] = texture.sampler;
    }
    mesh.bindGroup = device.createBindGroup((
      meshBindGroup.layout = program.bindGroupLayout,
      meshBindGroup.entries = entries,
      meshBindGroup
    ));
    meshBindGroup.layout = null;
    meshBindGroup.entries = null;
    drawMeshEntry.resource.buffer = null;
    drawFrameEntry.resource.buffer = null;
    drawTerrainEntry.resource = null;
    for (i = 0; i < textures.length; i++) {
      drawTextureEntries[i].resource = null;
      drawSamplerEntries[i].resource = null;
    }
    entries.length = 0;
  }
}
