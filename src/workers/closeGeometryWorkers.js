/**
 * Close a map's worker pool, terminating workers and rejecting pending tasks.
 *
 * @param {Object} pool Worker pool to close.
 */
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
