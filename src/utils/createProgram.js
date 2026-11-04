import { materialShaders } from './materialShaders.js';
import { elevationWGSL } from './elevationWGSL.js';


export function createProgram(backend, material = {}) {
  const shaders = materialShaders(
    material,
    !!backend.options.nightSparkle,
    material.terrain ? elevationWGSL : ''
  );
  const vertex = backend.renderer.device.createShaderModule({ code: shaders.vertex });
  const fragment = backend.renderer.device.createShaderModule({ code: shaders.fragment });
  Promise.all([
    vertex.getCompilationInfo(),
    fragment.getCompilationInfo()
  ]).then(infos => {
    const errors = infos.flatMap(info => info.messages).filter(message => message.type === 'error');
    if (errors.length) {
      backend.fire('error', {
        error: new Error(`Unable to compile Layer3D WGSL: ${errors.map(error => error.message).join('\n')}`),
      });
    }
  }).catch(error => backend.fire('error', { error }));
  const vertexBuffers = [
    { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
    { arrayStride: 12, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }] },
    material.vertexColors ? { arrayStride: 12, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x3' }] } : null,
    shaders.textured ? { arrayStride: 8, attributes: [{ shaderLocation: 3, offset: 0, format: 'float32x2' }] } : null,
  ];
  const bindGroupEntries = [{
    binding: 0,
    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    buffer: { type: 'uniform', hasDynamicOffset: true },
  }, {
    binding: 1,
    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    buffer: { type: 'uniform' },
  }];
  if (shaders.hasTerrain) {
    bindGroupEntries.push({
      binding: 2,
      visibility: GPUShaderStage.VERTEX,
      texture: { sampleType: 'unfilterable-float', viewDimension: '2d' },
    });
  }
  for (const texture of shaders.bindings) {
    bindGroupEntries.push({
      binding: texture.texture,
      visibility: GPUShaderStage.FRAGMENT,
      texture: { sampleType: 'float', viewDimension: '2d' },
    });
    bindGroupEntries.push({
      binding: texture.sampler,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: { type: 'filtering' },
    });
  }
  const bindGroupLayout = backend.renderer.device.createBindGroupLayout({ entries: bindGroupEntries });
  const pipelineLayout = backend.renderer.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout, backend.renderer.sunlight.layout] });
  return {
    device: backend.renderer.device,
    vertex,
    fragment,
    bindings: shaders.bindings,
    vertexBuffers,
    bindGroupLayout,
    pipelineLayout,
    pipelineCache: new Map(),
    cullMode: material.doubleSided ? 'none' : 'back',
    transparent: material.alphaMode === 'BLEND',
    depthWrite: material.depthWrite ?? material.alphaMode !== 'BLEND',
    depthTest: material.depthTest !== false,
    terrain: material.terrain,
    nightLight: Boolean(material.nightLight),
    nightSparkle: !!backend.options.nightSparkle,
    uniforms: {
      baseColor: { value: material.color || [1, 1, 1] },
      metallic: { value: material.metallic ?? 0 },
      roughness: { value: material.roughness ?? 0.85 },
      opacity: { value: material.opacity ?? 1 },
      alphaCutoff: { value: material.alphaCutoff ?? 0.5 },
      occlusionStrength: { value: material.occlusionStrength ?? 1 },
      emissive: { value: material.emissive || [0, 0, 0] },
      ...(material.baseTexture ? { baseTexture: { value: material.baseTexture } } : {}),
      ...(material.metalTexture ? { metalTexture: { value: material.metalTexture } } : {}),
      ...(material.emissiveTexture ? { emissiveTexture: { value: material.emissiveTexture } } : {}),
      ...(material.occlusionTexture ? { occlusionTexture: { value: material.occlusionTexture } } : {}),
      ...(material.roofTexture ? { roofTexture: { value: null } } : {}),
    },
    _layerMaterial: material,
  };
}
