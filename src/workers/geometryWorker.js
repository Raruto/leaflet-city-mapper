import { assembleAreaGeometry } from '../geometry/assembleAreaGeometry.js';
import { onVectorTileMessage } from './vectorTileWorker.js';
import { onCogMessage } from './cogWorker.js';
import { onModelMessage } from './modelWorker.js';

/**
 * Route worker requests to the appropriate source handler or assemble and transfer area geometry.
 *
 * @param {MessageEvent} event Worker request.
 */
export function onGeometryMessage(event) {
  if (event.data.type === 'model') {
    onModelMessage(event);
    return;
  }
  if (event.data.type === 'cog') {
    onCogMessage(event);
    return;
  }
  if (event.data.type === 'vector') {
    onVectorTileMessage(event);
    return;
  }
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
