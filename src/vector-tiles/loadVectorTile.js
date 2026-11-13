import { L } from '../globals/L.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorStyleZoom } from './vectorStyleZoom.js';
import { attachVectorTileBatches } from './attachVectorTileBatches.js';

/**
 * Fetch, prepare and attach a vector tile while its session remains current.
 *
 * @param {Object} tile Tile state and abort controller.
 *
 * @returns {Promise<void>} Completion of the load or error reporting.
 *
 * @throws {Error} HTTP errors are caught internally and emitted on the owning layer.
 */
export async function loadVectorTile(tile) {
  const { coords, controller } = tile, session = this.session;
  const { url, style, sourceId, maxZoom, maxNativeZoom } = vectorTileOptionsByLayer.get(this);
  const count = 2 ** coords.z, x = ((coords.x % count) + count) % count;
  let group;
  try {
    const tileUrl = L.Util.template(url, /* alloc */ { z: coords.z, x, y: coords.y });
    const response = await fetch(tileUrl, /* alloc */ { signal: controller.signal });
    if (!response.ok) throw /* alloc */ new Error(`Tile ${tile.key}: HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    if (controller.signal.aborted) return;
    const id = ++this.sequence, prepared = Promise.withResolvers();
    this.waiting.set(id, prepared);
    this.worker.postMessage(/* alloc */ { type: 'vector', id, buffer, coords, style, source: sourceId, maxZoom,
      zoom: vectorStyleZoom(this), mapZoom: coords.z >= maxNativeZoom ? maxZoom : this._map.getZoom() }, /* alloc */ [buffer]);
    const data = await prepared.promise;
    if (controller.signal.aborted || this.session !== session) return;
    group = /* alloc */ new L.LayerGroup().addTo(this._map);
    tile.rendered = /* alloc */ [];
    if (!await attachVectorTileBatches(this, tile, group, data.batches, session)) { group.remove(); return; }
    tile.group = group; tile.labelCandidates = data.labels;
    this.fire('tileload', /* alloc */ { coords, group });
    this.prune();
    this.refresh();
  } catch (error) {
    group?.remove();
    if (!controller.signal.aborted && this.session === session) this.fire('error', /* alloc */ { error });
  } finally {
    if (this.session === session) { this.inflight--; this.pump(); }
  }
}
