import { vectorLabelCandidates } from './vectorLabelCandidates.js';
import { vectorLabelCells } from './vectorLabelCells.js';
import { reserveVectorLabelCells } from './reserveVectorLabelCells.js';
import { updateVectorLabelMarker } from './updateVectorLabelMarker.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

export async function updateVectorTileLabels() {
  const session = this.session, revision = this.labelRevision = (this.labelRevision || 0) + 1;
  this.labelsReady = false;
  const candidates = vectorLabelCandidates(this), size = this._map.getSize();
  const occupied = /* alloc */ new Set(), retained = /* alloc */ new Set();
  let visited = 0, label, key, cells, marker;
  for (label of candidates) {
    if (++visited % 128 === 0) await yieldTask();
    if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
    cells = vectorLabelCells(this._map, label, size);
    if (!cells || !reserveVectorLabelCells(cells, occupied)) continue;
    key = `${label.text}:${label.latlng.join(':')}`;
    retained.add(key);
    if (updateVectorLabelMarker(this, label, key)) await yieldTask();
  }
  for ([key, marker] of this.labels) {
    if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
    if (!retained.has(key)) { marker.remove(); this.labels.delete(key); await yieldTask(); }
  }
  this.labelsReady = true;
}
