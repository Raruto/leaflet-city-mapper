import { meshBindGroup } from '../globals/meshBindGroup.js';
import { drawEntries } from '../globals/drawEntries.js';
import { drawMeshEntry } from '../globals/drawMeshEntry.js';
import { drawFrameEntry } from '../globals/drawFrameEntry.js';
import { drawTerrainEntry } from '../globals/drawTerrainEntry.js';
import { drawTextureEntries } from '../globals/drawTextureEntries.js';
import { drawSamplerEntries } from '../globals/drawSamplerEntries.js';

/**
 * Create the mesh bind group for frame uniforms, terrain and material textures.
 *
 * @param {Object} renderer Renderer providing the device and uniform buffer.
 * @param {Object} mesh Mesh whose bind group is updated.
 * @param {Array<Object>} textures Texture and sampler pairs in program binding order.
 */
export function bindMeshTextures(renderer, mesh, textures) {
  const { program } = mesh;
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
  let i, binding, texture;
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
  mesh.bindGroup = renderer.device.createBindGroup((
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
