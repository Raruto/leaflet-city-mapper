import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { geometryWorkerUrl } from '../globals/geometryWorkerUrl.js';
import { vectorTileEvents } from '../globals/vectorTileEvents.js';
import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { refreshVectorTiles } from './refreshVectorTiles.js';
import { onVectorTileMessage } from './onVectorTileMessage.js';
import { onVectorTileWorkerError } from './onVectorTileWorkerError.js';
import { createGeometryWorker } from '../workers/createGeometryWorker.js';
import { vectorWorkerByLayer } from '../weakmaps/vectorWorkerByLayer.js';

export function onVectorTileAdd(map) {
  const { style, pane } = vectorTileOptionsByLayer.get(this);
  let index, entry;
  for ([index] of style.entries()) {
    (map.getPane(`${pane}-${index}`) || map.createPane(`${pane}-${index}`)).style.zIndex = 200 + index;
  }
  for (entry of style) {
    if (entry.type !== 'background') continue;
    map.getContainer().style.background = evaluateStyle(entry.paint['background-color'], /* alloc */ {}, map.getZoom());
    break;
  }
  this.session = /* alloc */ {};
  this.tiles = /* alloc */ new Map(); this.labels = /* alloc */ new Map(); this.waiting = /* alloc */ new Map();
  this.retiring = /* alloc */ new Set();
  this.inflight = 0; this.sequence = 0;
  this.changedAt = 0; this.paintZoom = null;
  const workerEntry = createGeometryWorker(this.options.workerUrl || geometryWorkerUrl);
  vectorWorkerByLayer.set(this, workerEntry);
  this.worker = workerEntry.worker;
  this.worker.onmessage = onVectorTileMessage.bind(this);
  this.worker.onerror = onVectorTileWorkerError.bind(this);
  this.refresh = refreshVectorTiles.bind(this);
  map.on(vectorTileEvents, this.refresh);
  this.update();
}
