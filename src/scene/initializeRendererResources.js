import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { sceneSunlightUniforms } from '../globals/sceneSunlightUniforms.js';
import { resizeSunlight } from '../shadows/resizeSunlight.js';

export function initializeRendererResources(layer, device) {
  const layout = device.createBindGroupLayout(/* alloc */ {
    entries: /* alloc */ [
      /* alloc */ { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: /* alloc */ { type: 'uniform' } },
      /* alloc */ { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: /* alloc */ { sampleType: 'depth' } },
      /* alloc */ { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: /* alloc */ { type: 'comparison' } },
      /* alloc */ { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: /* alloc */ { type: 'read-only-storage' } },
    ]
  });
  const buffer = rendererByLayer.get(layer).device.createBuffer(/* alloc */ { size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const sampler = rendererByLayer.get(layer).device.createSampler(/* alloc */ { compare: 'less-equal', minFilter: 'linear', magFilter: 'linear' });
  const lights = rendererByLayer.get(layer).device.createBuffer(/* alloc */ { size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  rendererByLayer.get(layer).sunlight = /* alloc */ { layout, buffer, sampler, lights, size: 0 };
  rendererByLayer.get(layer).device.queue.writeBuffer(buffer, 0, sceneSunlightUniforms);
  resizeSunlight(layer, 1);
  const emptyImage = document.createElement('canvas');
  emptyImage.width = 1;
  emptyImage.height = 1;
  rendererByLayer.get(layer).roofFallbackTexture = /* alloc */ {
    device,
    texture: device.createTexture(/* alloc */ {
      size: /* alloc */ [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }),
    sampler: device.createSampler(/* alloc */ {
      addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
    }),
    image: emptyImage, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
}
