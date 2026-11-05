/** Emit a snapshot for consumers; ready does not wait for all neighborhood tasks. */
export function updateStatus(backend, enabled = true) {
  const progress = { enabled, loaded: 0, skipped: 0, pending: 0, errors: [] };
  let area;
  for (area of backend._areas.values()) {
    if (area.error) progress.errors.push(area.error);
    else if (!area.done) progress.pending++;
    progress.loaded += area.buildings ?? 0;
    progress.skipped += area.skipped ?? 0;
  }
  backend.fire('progress', progress);
}
