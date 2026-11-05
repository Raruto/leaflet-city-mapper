import { tiledBounds } from '../globals/tiledBounds.js';

import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';

export function gridlayerGetTiledPixelBounds(center) {
  if (!mapGetBearing(this._map) && !mapGetPitch(this._map)) return tiledBounds.value.call(this, center);
  const bounds = this._map.getBounds();
  return /* allocation: required -- Native tile selection retains the bounds of this independent viewport query. */ new L.Bounds(this._map.project(bounds.getNorthWest(), this._tileZoom),
    this._map.project(bounds.getSouthEast(), this._tileZoom));
}
