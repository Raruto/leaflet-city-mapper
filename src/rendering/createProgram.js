import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { materialShaders } from '../shaders/materialShaders.js';

import { reportCompilation } from './reportCompilation.js';

export function createProgram(backend, material = sharedState.allocationRenderDefaultMaterial) {
  const gpuCreateShaderModule1 = sharedState.allocationRenderCreateProgramCreateShaderModule1;
  const gpuCreateShaderModule2 = sharedState.allocationRenderCreateProgramCreateShaderModule2;
  const gpuCreateBindGroupLayout3 = sharedState.allocationRenderCreateProgramCreateBindGroupLayout3;
  const gpuCreatePipelineLayout4 = sharedState.allocationRenderCreateProgramCreatePipelineLayout4;
  const shaders = materialShaders(
    material,
    !!backend.options.nightSparkle,
    material.terrain ? sharedState.elevationWGSL : ''
  );
  const vertex = pluginState(backend).renderer.device.createShaderModule((
    gpuCreateShaderModule1.code = shaders.vertex,
    gpuCreateShaderModule1
  ));
  gpuCreateShaderModule1.code = null;
  const fragment = pluginState(backend).renderer.device.createShaderModule((
    gpuCreateShaderModule2.code = shaders.fragment,
    gpuCreateShaderModule2
  ));
  gpuCreateShaderModule2.code = null;
  reportCompilation(backend, /* allocation: required -- Each asynchronous compilation report owns its shader-promise batch. */ [
    vertex.getCompilationInfo(),
    fragment.getCompilationInfo()
  ]);
  const vertexBuffers = /* allocation: required -- The returned program retains its own vertex-buffer slot list. */ [
    sharedState.allocationRenderPositionLayout,
    sharedState.allocationRenderNormalLayout,
    material.vertexColors ? sharedState.allocationRenderColorLayout : null,
    shaders.textured ? sharedState.allocationRenderUVLayout : null,
  ];
  if (material.instanced) vertexBuffers.push(sharedState.allocationRenderInstanceLayout);
  const bindGroupEntries = sharedState.allocationRenderProgramEntries;
  bindGroupEntries.length = 0;
  sharedState.allocationRenderMeshLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
  sharedState.allocationRenderFrameLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
  bindGroupEntries.push(sharedState.allocationRenderMeshLayoutEntry, sharedState.allocationRenderFrameLayoutEntry);
  if (shaders.hasTerrain) {
    sharedState.allocationRenderTerrainLayoutEntry.visibility = GPUShaderStage.VERTEX;
    bindGroupEntries.push(sharedState.allocationRenderTerrainLayoutEntry);
  }

  let texture, entry, index = 0;
  for (texture of shaders.bindings) {
    entry = sharedState.allocationRenderTextureLayoutEntries[index];
    entry.binding = texture.texture;
    entry.visibility = GPUShaderStage.FRAGMENT;
    bindGroupEntries.push(entry);
    entry = sharedState.allocationRenderSamplerLayoutEntries[index++];
    entry.binding = texture.sampler;
    entry.visibility = GPUShaderStage.FRAGMENT;
    bindGroupEntries.push(entry);
  }
  const bindGroupLayout = pluginState(backend).renderer.device.createBindGroupLayout((
    gpuCreateBindGroupLayout3.entries = bindGroupEntries,
    gpuCreateBindGroupLayout3
  ));
  gpuCreateBindGroupLayout3.entries = null;
  const pipelineLayout = pluginState(backend).renderer.device.createPipelineLayout((
    gpuCreatePipelineLayout4.bindGroupLayouts[0] = bindGroupLayout,
    gpuCreatePipelineLayout4.bindGroupLayouts[1] = pluginState(backend).renderer.sunlight.layout,
    gpuCreatePipelineLayout4
  ));
  gpuCreatePipelineLayout4.bindGroupLayouts[0] = null;
  gpuCreatePipelineLayout4.bindGroupLayouts[1] = null;
  const uniforms = /* allocation: required -- Each returned program owns its mutable uniform table. */ {
    baseColor: /* allocation: required -- Each program retains its own mutable base-color uniform. */ { value: material.color || /* allocation: required -- Each program owns its mutable default base color. */ [1, 1, 1] },
    metallic: /* allocation: required -- Each program retains its own mutable metallic uniform. */ { value: material.metallic ?? 0 },
    roughness: /* allocation: required -- Each program retains its own mutable roughness uniform. */ { value: material.roughness ?? 0.85 },
    opacity: /* allocation: required -- Each program retains its own mutable opacity uniform. */ { value: material.opacity ?? 1 },
    alphaCutoff: /* allocation: required -- Each program retains its own mutable alpha-cutoff uniform. */ { value: material.alphaCutoff ?? 0.5 },
    occlusionStrength: /* allocation: required -- Each program retains its own mutable occlusion-strength uniform. */ { value: material.occlusionStrength ?? 1 },
    emissive: /* allocation: required -- Each program retains its own mutable emissive uniform. */ { value: material.emissive || /* allocation: required -- Each program owns its mutable default emissive color. */ [0, 0, 0] },
  };
  if (material.baseTexture) uniforms.baseTexture = /* allocation: required -- The program retains its own replaceable base-texture uniform. */ { value: material.baseTexture };
  if (material.metalTexture) uniforms.metalTexture = /* allocation: required -- The program retains its own replaceable metal-texture uniform. */ { value: material.metalTexture };
  if (material.emissiveTexture) uniforms.emissiveTexture = /* allocation: required -- The program retains its own replaceable emissive-texture uniform. */ { value: material.emissiveTexture };
  if (material.occlusionTexture) uniforms.occlusionTexture = /* allocation: required -- The program retains its own replaceable occlusion-texture uniform. */ { value: material.occlusionTexture };
  if (material.roofTexture) uniforms.roofTexture = /* allocation: required -- The program retains its own replaceable roof-atlas uniform. */ { value: null };
  return /* allocation: required -- Each caller retains a program with independent uniforms, material references and pipeline cache. */ {
    device: pluginState(backend).renderer.device,
    vertex,
    fragment,
    bindings: shaders.bindings,
    vertexBuffers,
    bindGroupLayout,
    pipelineLayout,
    pipelineCache: /* allocation: required -- Each program owns device-specific pipeline variants until disposal. */ new Map(),
    cullMode: material.doubleSided ? 'none' : 'back',
    transparent: material.alphaMode === 'BLEND',
    depthWrite: material.depthWrite ?? material.alphaMode !== 'BLEND',
    depthTest: material.depthTest !== false,
    terrain: material.terrain,
    nightLight: Boolean(material.nightLight),
    nightSparkle: !!backend.options.nightSparkle,
    uniforms,
    _layerMaterial: material,
  };
}
