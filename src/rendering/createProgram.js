import { defaultMaterial } from '../globals/defaultMaterial.js';
import { vertexShader } from '../globals/vertexShader.js';
import { fragmentShader } from '../globals/fragmentShader.js';
import { programLayout } from '../globals/programLayout.js';
import { pipelineLayout as sharedPipelineLayout } from '../globals/pipelineLayout.js';
import { elevationWGSL } from '../globals/elevationWGSL.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { positionLayout } from '../globals/positionLayout.js';
import { normalLayout } from '../globals/normalLayout.js';
import { colorLayout } from '../globals/colorLayout.js';
import { uVLayout } from '../globals/uVLayout.js';
import { instanceLayout } from '../globals/instanceLayout.js';
import { programEntries } from '../globals/programEntries.js';
import { meshLayoutEntry } from '../globals/meshLayoutEntry.js';
import { frameLayoutEntry } from '../globals/frameLayoutEntry.js';
import { terrainLayoutEntry } from '../globals/terrainLayoutEntry.js';
import { textureLayoutEntries } from '../globals/textureLayoutEntries.js';
import { samplerLayoutEntries } from '../globals/samplerLayoutEntries.js';


import { materialShaders } from '../shaders/materialShaders.js';

import { reportCompilation } from './reportCompilation.js';

export function createProgram(backend, material = defaultMaterial) {
  const shaders = materialShaders(
    material,
    !!backend.options.nightSparkle,
    material.terrain ? elevationWGSL : ''
  );
  const vertex = sceneByLayer.get(backend).renderer.device.createShaderModule((
    vertexShader.code = shaders.vertex,
    vertexShader
  ));
  vertexShader.code = null;
  const fragment = sceneByLayer.get(backend).renderer.device.createShaderModule((
    fragmentShader.code = shaders.fragment,
    fragmentShader
  ));
  fragmentShader.code = null;
  reportCompilation(backend, /* alloc */ [
    vertex.getCompilationInfo(),
    fragment.getCompilationInfo()
  ]);
  const vertexBuffers = /* alloc */ [
    positionLayout,
    normalLayout,
    material.vertexColors ? colorLayout : null,
    shaders.textured ? uVLayout : null,
  ];
  if (material.instanced) vertexBuffers.push(instanceLayout);
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
  const bindGroupLayout = sceneByLayer.get(backend).renderer.device.createBindGroupLayout((
    programLayout.entries = bindGroupEntries,
    programLayout
  ));
  programLayout.entries = null;
  const pipelineLayout = sceneByLayer.get(backend).renderer.device.createPipelineLayout((
    sharedPipelineLayout.bindGroupLayouts[0] = bindGroupLayout,
    sharedPipelineLayout.bindGroupLayouts[1] = sceneByLayer.get(backend).renderer.sunlight.layout,
    sharedPipelineLayout
  ));
  sharedPipelineLayout.bindGroupLayouts[0] = null;
  sharedPipelineLayout.bindGroupLayouts[1] = null;
  const uniforms = /* alloc */ {
    baseColor: /* alloc */ { value: material.color || /* alloc */ [1, 1, 1] },
    metallic: /* alloc */ { value: material.metallic ?? 0 },
    roughness: /* alloc */ { value: material.roughness ?? 0.85 },
    opacity: /* alloc */ { value: material.opacity ?? 1 },
    alphaCutoff: /* alloc */ { value: material.alphaCutoff ?? 0.5 },
    occlusionStrength: /* alloc */ { value: material.occlusionStrength ?? 1 },
    emissive: /* alloc */ { value: material.emissive || /* alloc */ [0, 0, 0] },
  };
  if (material.baseTexture) uniforms.baseTexture = /* alloc */ { value: material.baseTexture };
  if (material.metalTexture) uniforms.metalTexture = /* alloc */ { value: material.metalTexture };
  if (material.emissiveTexture) uniforms.emissiveTexture = /* alloc */ { value: material.emissiveTexture };
  if (material.occlusionTexture) uniforms.occlusionTexture = /* alloc */ { value: material.occlusionTexture };
  if (material.roofTexture) uniforms.roofTexture = /* alloc */ { value: null };
  return /* alloc */ {
    device: sceneByLayer.get(backend).renderer.device,
    vertex,
    fragment,
    bindings: shaders.bindings,
    vertexBuffers,
    bindGroupLayout,
    pipelineLayout,
    pipelineCache: /* alloc */ new Map(),
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
