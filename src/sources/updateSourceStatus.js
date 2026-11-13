import { areasByLayer } from '../weakmaps/areasByLayer.js';

/**
 * Emit a source progress snapshot; ready does not wait for all neighborhood tasks.
 *
 * @param {L.Layer} layer Source layer.
 * @param {boolean} [enabled] Enabled state to include in the snapshot.
 */
export function updateStatus(layer, enabled = true) {
  const progress = /* alloc */ { enabled, loaded: 0, skipped: 0, pending: 0, errors: /* alloc */ [] };
  let area;
  for (area of areasByLayer.get(layer).values()) {
    if (area.error) progress.errors.push(area.error);
    else if (!area.done) progress.pending++;
    progress.loaded += area.buildings ?? 0;
    progress.skipped += area.skipped ?? 0;
  }
  layer.fire('progress', progress);
}
