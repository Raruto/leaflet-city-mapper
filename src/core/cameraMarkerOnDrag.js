import { L } from '../globals/L.js';
import { dragByHandler } from '../weakmaps/dragByHandler.js';



export function cameraMarkerOnDrag(event) {
  const map = this._marker._map;
  const screen = L.DomUtil.getPosition(this._marker._icon).add(map._getMapPanePos());
  const point = map.containerPointToLayerPoint(screen);
  L.DomUtil.setPosition(this._marker._icon, point);
  dragByHandler.get(this)._cameraOriginalOnDrag.call(this, event);
  this._marker._setPos(point);
}
