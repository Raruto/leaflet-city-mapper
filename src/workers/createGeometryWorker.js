/**
 * Create a module worker, using a temporary blob for cross-origin URLs, and register it in the pool.
 *
 * @param {string} url Worker module URL.
 * @param {Object|null|undefined} pool Optional owner of the worker entry.
 *
 * @returns {Object} The worker entry, including its URL and optional blob URL.
 *
 * @throws {Error} If Web Workers are unavailable.
 */
export function createGeometryWorker(url, pool) {
  if (typeof Worker === 'undefined') throw /* alloc */ new Error('Web Workers are required to prepare source geometry');
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
  const entry = /* alloc */ { url, pool, worker, blobUrl };
  if (pool) pool.entries.add(entry);
  return entry;
}
