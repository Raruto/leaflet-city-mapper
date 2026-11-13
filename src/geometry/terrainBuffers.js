import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { terrainGridsByLayer } from '../weakmaps/terrainGridsByLayer.js';
import { demBuffer } from '../globals/demBuffer.js';
import { terrainGrid } from './terrainGrid.js';

/**
 * Get or create cached GPU buffers for a terrain grid subdivision count.
 *
 * @param {L.Layer} layer Terrain layer owning the cache.
 * @param {number} divisions Grid subdivisions per side.
 *
 * @returns {Object} GPU-backed grid attributes.
 */
export function terrainBuffers(layer, divisions) {
  const device = rendererByLayer.get(layer).device
  let attributes = terrainGridsByLayer.get(layer).get(divisions);
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
    terrainGridsByLayer.get(layer).set(divisions, attributes);
  }
  return attributes;
}
