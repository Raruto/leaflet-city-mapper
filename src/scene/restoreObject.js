import { createProgram } from '../rendering/createProgram.js';

export function restoreObject(backend, shared, object) {
  if (object.geometry && object.geometry.device !== shared.renderer.device) {
    const geometry = object.geometry;
    const material = object.program._layerMaterial;
    const attributes = {};
    for (const name of ['position', 'normal', 'color', 'uv', 'index', 'instanceOffset']) {
      const attribute = geometry.attributes[name];
      if (!attribute) continue;
      const { data, size, count, normalized } = attribute;
      attributes[name] = { data: data.slice(0, count * size), size, normalized };
    }
    const device = shared.renderer.device;
    if (attributes.index?.data instanceof Uint8Array) {
      attributes.index.data = Uint16Array.from(attributes.index.data);
    }
    for (const [name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
      attribute.buffer = device.createBuffer({
        size: Math.max(4, attribute.data.byteLength),
        usage: name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    object.geometry = {
      device,
      attributes,
      drawRange: { start: 0, count: attributes.index?.count || attributes.position.count },
    };
    for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
    object.bindGroup = null;
    object.boundTextures = [];
    for (const key of ['baseTexture', 'metalTexture', 'emissiveTexture', 'occlusionTexture']) {
      const texture = material[key];
      if (!texture || texture.device === device) continue;
      material[key] = {
        ...texture,
        device,
        texture: device.createTexture({
          size: [texture.image.width, texture.image.height],
          format: texture.format,
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }),
        sampler: device.createSampler(texture.samplerOptions),
        uploaded: null,
      };
    }
    object.program.pipelineCache.clear();
    object.program = createProgram(backend, material);
    object.device = device;
  }
  if (object.texture && object.texture.device !== shared.renderer.device) {
    object.texture = {
      ...object.texture,
      device: shared.renderer.device,
      texture: shared.renderer.device.createTexture({
        size: [object.texture.image.width, object.texture.image.height],
        format: object.texture.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: shared.renderer.device.createSampler(object.texture.samplerOptions),
      uploaded: null,
    };
  }
}
