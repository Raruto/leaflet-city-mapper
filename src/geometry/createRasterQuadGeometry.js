import { rasterBuffer } from '../globals/rasterBuffer.js';
import { rasterPositions } from '../globals/rasterPositions.js';
import { rasterNormals } from '../globals/rasterNormals.js';
import { rasterUVs } from '../globals/rasterUVs.js';
import { rasterIndices } from '../globals/rasterIndices.js';

export function createGeometry(device) {
  const attributes = /* alloc */ {
    position: /* alloc */ { size: 3, data: /* alloc */ new Float32Array(rasterPositions) },
    normal: /* alloc */ { size: 3, data: /* alloc */ new Float32Array(rasterNormals) },
    uv: /* alloc */ { size: 2, data: /* alloc */ new Float32Array(rasterUVs) },
    index: /* alloc */ { data: /* alloc */ new Uint16Array(rasterIndices) },
  };
  let name, attribute;
  for ([name, attribute] of Object.entries(attributes)) {
    attribute.count = attribute.data.length / (attribute.size || 1);
    attribute.indexFormat = 'uint16';
    attribute.buffer = device.createBuffer((
      rasterBuffer.size = attribute.data.byteLength,
      rasterBuffer.usage = name === 'index' ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      rasterBuffer
    ));

    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  return /* alloc */ { device, attributes, drawRange: /* alloc */ { start: 0, count: attributes.index.count } };
}
