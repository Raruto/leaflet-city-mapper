export function closeGeometryWorkers(pool) {
  pool.closed = true;
  let entry;
  for (entry of pool.entries) {
    entry.closed = true;
    entry.worker.terminate();
    if (entry.task) entry.task.reject(/* alloc */ new DOMException('Map removed', 'AbortError'));
  }
  pool.entries.clear();
  pool.idle.length = 0;
}
