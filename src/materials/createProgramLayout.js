import { programLayout } from '../globals/programLayout.js';
import { programEntries } from '../globals/programEntries.js';
import { meshLayoutEntry } from '../globals/meshLayoutEntry.js';
import { frameLayoutEntry } from '../globals/frameLayoutEntry.js';
import { terrainLayoutEntry } from '../globals/terrainLayoutEntry.js';
import { textureLayoutEntries } from '../globals/textureLayoutEntries.js';
import { samplerLayoutEntries } from '../globals/samplerLayoutEntries.js';

/**
 * Create a bind group layout for mesh, frame, terrain and shader texture bindings.
 *
 * @param {GPUDevice} device Device creating the layout.
 * @param {Object} shaders Shader bindings and terrain requirements.
 *
 * @returns {GPUBindGroupLayout} The created layout.
 */
export function createProgramLayout(device, shaders) {
  const bindGroupEntries = programEntries;
  bindGroupEntries.length = 0;
  meshLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
  frameLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
  bindGroupEntries.push(meshLayoutEntry, frameLayoutEntry);
  if (shaders.hasTerrain) {
    terrainLayoutEntry.visibility = GPUShaderStage.VERTEX;
    bindGroupEntries.push(terrainLayoutEntry);
  }
  let texture, entry, index = 0;
  for (texture of shaders.bindings) {
    entry = textureLayoutEntries[index];
    entry.binding = texture.texture;
    entry.visibility = GPUShaderStage.FRAGMENT;
    bindGroupEntries.push(entry);
    entry = samplerLayoutEntries[index++];
    entry.binding = texture.sampler;
    entry.visibility = GPUShaderStage.FRAGMENT;
    bindGroupEntries.push(entry);
  }
  const layout = device.createBindGroupLayout((
    programLayout.entries = bindGroupEntries,
    programLayout
  ));
  programLayout.entries = null;
  return layout;
}
