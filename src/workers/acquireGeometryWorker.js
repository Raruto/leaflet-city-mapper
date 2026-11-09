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
  let workerUrl = url, blobUrl, worker;
  if (globalThis.location) {
    const resolved = /* alloc */ new URL(url, location.href);
    if ((resolved.protocol === 'https:' || resolved.protocol === 'http:') && resolved.origin !== location.origin) {
      blobUrl = URL.createObjectURL(/* alloc */ new Blob(/* alloc */ [`import ${JSON.stringify(resolved.href)};`],
        /* alloc */ { type: 'text/javascript' }));
      workerUrl = blobUrl;
    }
  }
  try {
    worker = /* alloc */ new Worker(workerUrl, /* alloc */ { type: 'module' });
  } finally {
    if (!worker && blobUrl) URL.revokeObjectURL(blobUrl);
  }
  entry = /* alloc */ { url, pool, worker, blobUrl };
  if (pool) pool.entries.add(entry);
  return entry;
}
