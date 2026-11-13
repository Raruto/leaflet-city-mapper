import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { createProgram } from '../materials/createProgram.js';

export function createModelGeometry(context, primitive, attributes) {
  const style = context.materials[primitive.material] || /* alloc */ {
    color: /* alloc */ [1, 1, 1], metallic: 1,
  };
  if ((style.baseTexture || style.metalTexture || style.emissiveTexture || style.occlusionTexture) && !attributes.uv) {
    throw /* alloc */ new Error('Textured model mesh requires UV coordinates');
  }
  const program = createProgram(context.backend, style);
  context.resources.push(program);
  const device = rendererByLayer.get(context.backend).device;
  let name, attribute;
  for ([name, attribute] of Object.entries(attributes)) {
    attribute.size ||= 1;
    attribute.count = attribute.data.length / attribute.size;
    attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
    attribute.buffer = device.createBuffer(/* alloc */ {
      size: Math.max(4, attribute.data.byteLength),
      usage: name === 'index'
        ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  const geometry = /* alloc */ {
    device, attributes,
    drawRange: /* alloc */ { start: 0, count: attributes.index?.count || attributes.position.count },
  };
  context.resources.push(geometry);
  return /* alloc */ { device, geometry, program };
}
