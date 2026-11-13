import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { L } from '../globals/L.js';
import { closestMethods } from '../weakmaps/closestMethods.js';
import { boundsMethods } from '../weakmaps/boundsMethods.js';
import { gridInitializers } from '../weakmaps/gridInitializers.js';
import { noOperation } from '../utils/noOperation.js';
import { emptyEvents } from '../scene/emptyEvents.js';
import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';
import { closestCameraLayerPoint } from './closestCameraLayerPoint.js';
import { cameraCircleBounds } from './cameraCircleBounds.js';
import { initializeGridContainer } from './initializeGridContainer.js';
import { updateGridOpacity } from './updateGridOpacity.js';
import { addRasterImage } from '../textures/attachRasterImage.js';
import { redrawPath } from './redrawPath.js';

/** Install camera and GPU integration hooks appropriate to this native Leaflet layer. */
export function initializeNativeLayer() {
  if (this instanceof L.Polyline || this instanceof L.CircleMarker) {
    this.beforeAdd = this._updateBounds = noOperation;
    this.redraw = redrawPath;
    kindByLayer.set(this, 'path');
    if (this instanceof L.Polyline) {
      closestMethods.set(this, this.closestLayerPoint);
      this.closestLayerPoint = closestCameraLayerPoint;
    }
    if (this instanceof L.Circle) {
      boundsMethods.set(this, this.getBounds);
      this.getBounds = cameraCircleBounds;
    }
  } else if (this instanceof L.GridLayer) {
    gridInitializers.set(this, this._initContainer);
    this._initContainer = initializeGridContainer;
    this._updateOpacity = updateGridOpacity;
  } else if (this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)) {
    kindByLayer.set(this, 'image');
    this._reset = refreshNativeLayerContract;
  }
}
