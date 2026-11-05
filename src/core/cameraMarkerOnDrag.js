import { pluginState } from './pluginState.js';

export function cameraMarkerOnDrag(event) {
  const map = this._marker._map;
  const screen = L.DomUtil.getPosition(this._marker._icon).add(map._getMapPanePos());
  const point = map.containerPointToLayerPoint(screen);
  L.DomUtil.setPosition(this._marker._icon, point);
  pluginState(this)._cameraOriginalOnDrag.call(this, event);
  this._marker._setPos(point);
}
