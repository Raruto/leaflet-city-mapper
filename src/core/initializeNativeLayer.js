import { sceneByLayer } from '../globals/sceneByLayer.js';
import { closestMethods } from '../globals/closestMethods.js';
import { boundsMethods } from '../globals/boundsMethods.js';
import { gridInitializers } from '../globals/gridInitializers.js';


import { noOperation } from '../utils/noOperation.js';
import { emptyEvents } from '../scene/emptyEvents.js';
import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';

import { closestCameraLayerPoint } from './closestCameraLayerPoint.js';
import { cameraCircleBounds } from './cameraCircleBounds.js';
import { initializeGridContainer } from './initializeGridContainer.js';
import { updateGridOpacity } from './updateGridOpacity.js';
import { addRasterImage } from './addRasterImage.js';
import { redrawPath } from './redrawPath.js';

export function initializeNativeLayer() {
  if (this instanceof L.Polyline || this instanceof L.CircleMarker) {
    this.beforeAdd = this._updateBounds = noOperation;
    this.redraw = redrawPath;
    sceneByLayer.get(this).kind = 'path';
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
    sceneByLayer.get(this).kind = 'image';
    this._reset = refreshNativeLayerContract;
  }
}
