import { geometryWorkersByMap } from '../weakmaps/geometryWorkersByMap.js';
import { closeGeometryWorkers } from './closeGeometryWorkers.js';
import { createGeometryWorker } from './createGeometryWorker.js';

/**
 * Reuse an idle worker for the URL or create one, closing the map's pool on unload.
 *
 * @param {L.Map|null|undefined} map Owner of the worker pool, if available.
 * @param {string} url Worker module URL.
 *
 * @returns {Object} The acquired worker entry.
 *
 * @throws {DOMException} If the map's worker pool is closed.
 */
export function acquireGeometryWorker(map, url) {
  let pool = map && geometryWorkersByMap.get(map);
  if (map && !pool) {
    pool = /* alloc */ { entries: /* alloc */ new Set(), idle: /* alloc */ [], closed: false };
    geometryWorkersByMap.set(map, pool);
    map.once('unload', closeGeometryWorkers.bind(null, pool));
  }
  let entry, i;
  if (pool) {
    if (pool.closed) throw /* alloc */ new DOMException('Map removed', 'AbortError');
    for (i = 0; i < pool.idle.length; i++) {
      if (pool.idle[i].url !== url) continue;
      entry = pool.idle[i];
      pool.idle.splice(i, 1);
      return entry;
    }
    entry = pool.idle.pop();
    if (entry) {
      entry.closed = true;
      entry.worker.terminate();
      pool.entries.delete(entry);
    }
  }
  return createGeometryWorker(url, pool);
}
