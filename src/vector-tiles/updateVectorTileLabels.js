import { vectorLabelCandidates } from './vectorLabelCandidates.js';
import { vectorLabelCells } from './vectorLabelCells.js';
import { reserveVectorLabelCells } from './reserveVectorLabelCells.js';
import { updateVectorLabelMarker } from './updateVectorLabelMarker.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

/**
 * Place visible vector labels without overlapping occupied cells and remove stale markers.
 *
 * @returns {Promise<void>} Completion of the current placement revision.
 */
export async function updateVectorTileLabels() {
  const session = this.session, revision = this.labelRevision = (this.labelRevision || 0) + 1;
  this.labelsReady = false;
  const candidates = vectorLabelCandidates(this), size = this._map.getSize();
  const occupied = /* alloc */ new Set(), retained = /* alloc */ new Set();
  let visited = 0, label, key, cells, marker;
  for (label of candidates) {
    if (++visited % 128 === 0) await yieldTask();
    if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
    cells = vectorLabelCells(this, label, size);
    if (!cells || !label.allowOverlap && !reserveVectorLabelCells(cells, occupied)) continue;
    key = `${label.text}${label.icon || ''}:${label.latlng.join(':')}`;
    retained.add(key);
    if (updateVectorLabelMarker(this, label, key)) await yieldTask();
  }
  for ([key, marker] of this.labels) {
    if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
    if (!retained.has(key)) { marker.remove(); this.labels.delete(key); await yieldTask(); }
  }
  this.labelsReady = true;
}
