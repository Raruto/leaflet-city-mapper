import { geometryWorkersByMap } from '../weakmaps/geometryWorkersByMap.js';
import { closeGeometryWorkers } from './closeGeometryWorkers.js';

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
  entry = /* alloc */ {
    url, pool, worker: /* alloc */ new Worker(url, /* alloc */ { type: 'module' }),
  };
  if (pool) pool.entries.add(entry);
  return entry;
}
