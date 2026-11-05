import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';
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
    this.beforeAdd = pluginState(this).onAdd = pluginState(this).onRemove = this._updateBounds = noOperation;
    this.redraw = redrawPath;
    pluginState(this).getEvents = emptyEvents;
    if (this instanceof L.Polyline) {
      sharedState.closestMethods.set(this, this.closestLayerPoint);
      this.closestLayerPoint = closestCameraLayerPoint;
    }
    if (this instanceof L.Circle) {
      sharedState.boundsMethods.set(this, this.getBounds);
      this.getBounds = cameraCircleBounds;
    }
  } else if (this instanceof L.GridLayer) {
    sharedState.gridInitializers.set(this, this._initContainer);
    this._initContainer = initializeGridContainer;
    this._updateOpacity = updateGridOpacity;
  } else if (this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)) {
    pluginState(this).onAdd = addRasterImage;
    pluginState(this).onRemove = noOperation;
    pluginState(this).getEvents = emptyEvents;
    this._reset = refreshNativeLayerContract;
  }
}
