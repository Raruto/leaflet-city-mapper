import { assembleAreaGeometry } from '../geometry/assembleAreaGeometry.js';

export function onGeometryMessage(event) {
  try {
    const data = assembleAreaGeometry(event.data);
    const transfers = /* alloc */ [data.positions.buffer, data.normals.buffer, data.colors.buffer, data.uvs.buffer];
    if (data.instanceOffsets) transfers.push(data.instanceOffsets.buffer);
    self.postMessage(data, transfers);
  } catch (error) {
    self.postMessage(/* alloc */ { error: /* alloc */ { name: error.name, message: error.message } });
  }
}

self.addEventListener('message', onGeometryMessage);
