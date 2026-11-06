import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { defaultMaterial } from '../globals/defaultMaterial.js';
import { vertexShader } from '../globals/vertexShader.js';
import { fragmentShader } from '../globals/fragmentShader.js';
import { pipelineLayout as sharedPipelineLayout } from '../globals/pipelineLayout.js';
import { elevationWGSL } from '../globals/elevationWGSL.js';
import { positionLayout } from '../globals/positionLayout.js';
import { normalLayout } from '../globals/normalLayout.js';
import { colorLayout } from '../globals/colorLayout.js';
import { uVLayout } from '../globals/uVLayout.js';
import { instanceLayout } from '../globals/instanceLayout.js';
import { createProgramLayout } from './createProgramLayout.js';
import { createProgramUniforms } from './createProgramUniforms.js';


import { materialShaders } from '../shaders/materialShaders.js';

import { reportCompilation } from './reportCompilation.js';

export function createProgram(layer, material = defaultMaterial) {
  const shaders = materialShaders(
    material,
    !!layer.options.nightSparkle,
    material.terrain ? elevationWGSL : ''
  );
  const vertex = rendererByLayer.get(layer).device.createShaderModule((
    vertexShader.code = shaders.vertex,
    vertexShader
  ));
  vertexShader.code = null;
  const fragment = rendererByLayer.get(layer).device.createShaderModule((
    fragmentShader.code = shaders.fragment,
    fragmentShader
  ));
  fragmentShader.code = null;
  reportCompilation(layer, /* alloc */ [
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
  const bindGroupLayout = createProgramLayout(rendererByLayer.get(layer).device, shaders);
  const pipelineLayout = rendererByLayer.get(layer).device.createPipelineLayout((
    sharedPipelineLayout.bindGroupLayouts[0] = bindGroupLayout,
    sharedPipelineLayout.bindGroupLayouts[1] = rendererByLayer.get(layer).sunlight.layout,
    sharedPipelineLayout
  ));
  sharedPipelineLayout.bindGroupLayouts[0] = null;
  sharedPipelineLayout.bindGroupLayouts[1] = null;
  const uniforms = createProgramUniforms(material);
  return /* alloc */ {
    device: rendererByLayer.get(layer).device,
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
    nightSparkle: !!layer.options.nightSparkle,
    uniforms,
    _layerMaterial: material,
  };
}
