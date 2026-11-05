import { pluginState } from '../core/pluginState.js';
import { createProgram } from '../rendering/createProgram.js';

export function restoreObject(object, backend) {
  const shared = pluginState(backend)._shared;
  let name, attribute, oldBuffer, texture;
  if (object.geometry && object.geometry.device !== pluginState(shared).renderer.device) {
    const geometry = object.geometry;
    const material = object.program._layerMaterial;
    const device = pluginState(shared).renderer.device;
    if (geometry.attributes.index?.data instanceof Uint8Array) {
      geometry.attributes.index.data = /* allocation: required -- WebGPU index buffers must not use uint8 data. */ new Uint16Array(geometry.attributes.index.data);
    }
    for (name in geometry.attributes) {
      attribute = geometry.attributes[name];
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
      oldBuffer = attribute.buffer;
      attribute.buffer = device.createBuffer(/* allocation: required -- Supply a fresh GPU descriptor for the replacement buffer. */ {
        size: Math.max(4, attribute.data.byteLength),
        usage: name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      oldBuffer?.destroy();
    }
    geometry.device = device;
    geometry.drawRange.count = geometry.attributes.index?.count || geometry.attributes.position.count;
    object.bindGroup = null;
    if (object.boundTextures) object.boundTextures.length = 0;
    else object.boundTextures = /* allocation: required -- Preserve each object's independent texture bindings. */ [];
    for (name in material) {
      if (name !== 'baseTexture' && name !== 'metalTexture' && name !== 'emissiveTexture' && name !== 'occlusionTexture') continue;
      texture = material[name];
      if (!texture || texture.device === device) continue;
      texture.device = device;
      texture.texture = device.createTexture(/* allocation: required -- Supply a fresh GPU descriptor for the replacement texture. */ {
          size: /* allocation: required -- Snapshot the image dimensions for this GPU operation. */ [texture.image.width, texture.image.height],
          format: texture.format,
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
      texture.sampler = device.createSampler(texture.samplerOptions);
      texture.uploaded = null;
    }
    object.program.pipelineCache.clear();
    object.program = createProgram(backend, material);
    object.device = device;
  }
  if (object.texture && object.texture.device !== pluginState(shared).renderer.device) {
    texture = object.texture;
    texture.device = pluginState(shared).renderer.device;
    texture.texture = pluginState(shared).renderer.device.createTexture(/* allocation: required -- Supply a fresh GPU descriptor for this replacement texture. */ {
        size: /* allocation: required -- Snapshot the image dimensions for this GPU operation. */ [object.texture.image.width, object.texture.image.height],
        format: object.texture.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
    texture.sampler = pluginState(shared).renderer.device.createSampler(texture.samplerOptions);
    texture.uploaded = null;
  }
}
