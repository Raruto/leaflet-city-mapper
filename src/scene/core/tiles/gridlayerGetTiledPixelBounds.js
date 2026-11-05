import { mapCameraState } from '../../camera/constants/mapCameraState.js';

export function gridlayerGetTiledPixelBounds(center) {
  if (!this._map.getBearing() && !this._map.getPitch()) return mapCameraState.tiledBounds.call(this, center);
  const bounds = this._map.getBounds();
  return new L.Bounds(this._map.project(bounds.getNorthWest(), this._tileZoom),
    this._map.project(bounds.getSouthEast(), this._tileZoom));
}
