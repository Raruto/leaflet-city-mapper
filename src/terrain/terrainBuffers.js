import { demBuffer } from '../globals/demBuffer.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { terrainGrid } from './terrainGrid.js';

export function terrainBuffers(backend, divisions) {
  const state = sceneByLayer.get(backend), device = state.renderer.device;
  let attributes = state._terrainGrids.get(divisions);
  if (!attributes) {
    attributes = terrainGrid(divisions);
    let name, attribute;
    for ([name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = 'uint16';
      attribute.buffer = device.createBuffer((
        demBuffer.size = Math.max(4, attribute.data.byteLength),
        demBuffer.usage = name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        demBuffer
      ));
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    state._terrainGrids.set(divisions, attributes);
  }
  return attributes;
}
