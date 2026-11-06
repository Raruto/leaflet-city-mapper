import { defaultMaterial } from '../globals/defaultMaterial.js';
import { vertexShader } from '../globals/vertexShader.js';
import { fragmentShader } from '../globals/fragmentShader.js';
import { pipelineLayout as sharedPipelineLayout } from '../globals/pipelineLayout.js';
import { elevationWGSL } from '../globals/elevationWGSL.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { positionLayout } from '../globals/positionLayout.js';
import { normalLayout } from '../globals/normalLayout.js';
import { colorLayout } from '../globals/colorLayout.js';
import { uVLayout } from '../globals/uVLayout.js';
import { instanceLayout } from '../globals/instanceLayout.js';
import { createProgramLayout } from './createProgramLayout.js';
import { createProgramUniforms } from './createProgramUniforms.js';


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
  const bindGroupLayout = createProgramLayout(sceneByLayer.get(backend).renderer.device, shaders);
  const pipelineLayout = sceneByLayer.get(backend).renderer.device.createPipelineLayout((
    sharedPipelineLayout.bindGroupLayouts[0] = bindGroupLayout,
    sharedPipelineLayout.bindGroupLayouts[1] = sceneByLayer.get(backend).renderer.sunlight.layout,
    sharedPipelineLayout
  ));
  sharedPipelineLayout.bindGroupLayouts[0] = null;
  sharedPipelineLayout.bindGroupLayouts[1] = null;
  const uniforms = createProgramUniforms(material);
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
