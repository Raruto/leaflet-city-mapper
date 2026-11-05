import { rasterBuffer } from '../globals/rasterBuffer.js';
import { rasterPositions } from '../globals/rasterPositions.js';
import { rasterNormals } from '../globals/rasterNormals.js';
import { rasterUVs } from '../globals/rasterUVs.js';
import { rasterIndices } from '../globals/rasterIndices.js';


export function createGeometry(device) {
  const attributes = /* allocation: required -- Each raster geometry owns its attribute table and GPU buffer lifetimes. */ {
    position: /* allocation: required -- The raster geometry retains position metadata and its GPU buffer. */ { size: 3, data: /* allocation: required -- Each raster geometry owns its mutable CPU attribute data and GPU upload lifetime. */ new Float32Array(rasterPositions) },
    normal: /* allocation: required -- The raster geometry retains normal metadata and its GPU buffer. */ { size: 3, data: /* allocation: required -- Each raster geometry owns its mutable CPU attribute data and GPU upload lifetime. */ new Float32Array(rasterNormals) },
    uv: /* allocation: required -- The raster geometry retains UV metadata and its GPU buffer. */ { size: 2, data: /* allocation: required -- Each raster geometry owns its mutable CPU attribute data and GPU upload lifetime. */ new Float32Array(rasterUVs) },
    index: /* allocation: required -- The raster geometry retains index metadata and its GPU buffer. */ { data: /* allocation: required -- Each raster geometry owns its mutable CPU attribute data and GPU upload lifetime. */ new Uint16Array(rasterIndices) },
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
  return /* allocation: required -- The raster backend retains this geometry until its device resources are released. */ { device, attributes, drawRange: /* allocation: required -- Each raster geometry retains its independently mutable draw range. */ { start: 0, count: attributes.index.count } };
}
