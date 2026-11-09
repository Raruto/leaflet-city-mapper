import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorStyleZoom } from './vectorStyleZoom.js';
import { reportError } from '../scene/reportLayerError.js';

export function updateVectorTiles() {
  if (!this.session) return;
  const { minNativeZoom, maxNativeZoom } = vectorTileOptionsByLayer.get(this);
  const z = Math.max(minNativeZoom, Math.min(maxNativeZoom, Math.floor(vectorStyleZoom(this))));
  const bounds = this._map.getBounds(), count = 2 ** z;
  const nw = this._map.project(bounds.getNorthWest(), z).divideBy(256);
  const se = this._map.project(bounds.getSouthEast(), z).divideBy(256);
  let tile, x, y, key;
  for (tile of this.tiles.values()) tile.needed = false;
  for (x = Math.floor(nw.x); x <= Math.floor(se.x); x++) {
    for (y = Math.max(0, Math.floor(nw.y)); y <= Math.min(count - 1, Math.floor(se.y)); y++) {
      key = `${z}/${x}/${y}`;
      tile = this.tiles.get(key);
      if (!tile) {
        tile = /* alloc */ { key, coords: /* alloc */ { z, x, y }, controller: /* alloc */ new AbortController() };
        this.tiles.set(key, tile);
      }
      tile.needed = true;
    }
  }
  this.prune();
  this.pump();
  this.updatePaint().catch(reportError.bind(null, this));
  this.updateLabels().catch(reportError.bind(null, this));
}
