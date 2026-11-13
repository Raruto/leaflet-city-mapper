
import { cancelGridFade } from '../animations/cancelGridFade.js';
import { scheduleGridFade } from '../animations/scheduleGridFade.js';
import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';

/** Update this grid layer's GPU tile fades and schedule further frames when needed. */
export function updateGridOpacity() {
  if (!this._map) return;
  const layer = this, now = Date.now();
  let fading = false, prune = false;
  let key, tile;
  for (key in this._tiles) {
    if (!Object.hasOwn(this._tiles, key)) continue;
    tile = this._tiles[key];
    if (!tile.current || !tile.loaded) continue;
    tile._gpuOpacity = this._map._fadeAnimated ? Math.min(1, (now - tile.loaded) / 200) : 1;
    if (tile._gpuOpacity < 1) fading = true;
    else if (!tile.active) {
      this._onOpaqueTile(tile);
      tile.active = true;
      prune = true;
    }
  }
  if (prune && !this._noPrune) this._pruneTiles();
  refreshNativeLayerContract(this);
  cancelGridFade(layer);
  if (fading) scheduleGridFade(layer);
}
