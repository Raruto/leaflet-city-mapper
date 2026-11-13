import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sceneSunlightUniforms } from '../globals/sceneSunlightUniforms.js';
import { resizeSunlight } from '../shadows/resizeSunlight.js';

/**
 * Create sunlight bindings and a fallback roof texture for the layer's renderer.
 *
 * @param {L.Layer} layer Layer owning the renderer.
 * @param {GPUDevice} device Device used to create the resources.
 */
export function initializeRendererResources(layer, device) {
  const renderer = rendererByLayer.get(layer);
  const layout = device.createBindGroupLayout(/* alloc */ {
    entries: /* alloc */ [
      /* alloc */ { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: /* alloc */ { type: 'uniform' } },
      /* alloc */ { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: /* alloc */ { sampleType: 'depth' } },
      /* alloc */ { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: /* alloc */ { type: 'comparison' } },
      /* alloc */ { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: /* alloc */ { type: 'read-only-storage' } },
    ]
  });
  const buffer = device.createBuffer(/* alloc */ { size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const sampler = device.createSampler(/* alloc */ { compare: 'less-equal', minFilter: 'linear', magFilter: 'linear' });
  const lights = device.createBuffer(/* alloc */ { size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  renderer.sunlight = /* alloc */ { layout, buffer, sampler, lights, size: 0 };
  device.queue.writeBuffer(buffer, 0, sceneSunlightUniforms);
  resizeSunlight(layer, 1);
  renderer.roofFallbackTexture = /* alloc */ {
    device,
    texture: device.createTexture(/* alloc */ {
      size: /* alloc */ [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }),
    sampler: device.createSampler(/* alloc */ {
      addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
    }),
    image: null, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
}
