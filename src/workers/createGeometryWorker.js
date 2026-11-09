export function createGeometryWorker(url, pool) {
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
