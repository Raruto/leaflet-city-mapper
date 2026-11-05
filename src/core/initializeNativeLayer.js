import { noOperation } from '../scene/noOperation.js';
import { emptyEvents } from '../scene/emptyEvents.js';
import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';
import { bringNativeLayerToFront } from './bringNativeLayerToFront.js';
import { bringNativeLayerToBack } from './bringNativeLayerToBack.js';
import { indexState } from '../constants/indexState.js';
import { closestCameraLayerPoint } from './closestCameraLayerPoint.js';
import { cameraCircleBounds } from './cameraCircleBounds.js';
import { initializeGridContainer } from './initializeGridContainer.js';
import { updateGridOpacity } from './updateGridOpacity.js';
import { addRasterImage } from './addRasterImage.js';

export function initializeNativeLayer() {
  if (this instanceof L.Polyline || this instanceof L.CircleMarker) {
    this.beforeAdd = this.onAdd = this.onRemove = this._updateBounds = noOperation;
    this.getEvents = emptyEvents;
    this._renderer = {
      options: { tolerance: 0 },
      _updatePath: refreshNativeLayerContract,
      _updateStyle: refreshNativeLayerContract,
      _bringToFront: bringNativeLayerToFront,
      _bringToBack: bringNativeLayerToBack,
    };
    if (this instanceof L.Polyline) {
      indexState.closestMethods.set(this, this.closestLayerPoint);
      this.closestLayerPoint = closestCameraLayerPoint;
    }
    if (this instanceof L.Circle) {
      indexState.boundsMethods.set(this, this.getBounds);
      this.getBounds = cameraCircleBounds;
    }
  } else if (this instanceof L.GridLayer) {
    indexState.gridInitializers.set(this, this._initContainer);
    this._initContainer = initializeGridContainer;
    this._updateOpacity = updateGridOpacity;
  } else if (this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)) {
    this.onAdd = addRasterImage;
    this.onRemove = noOperation;
    this.getEvents = emptyEvents;
    this._reset = refreshNativeLayerContract;
  }
}
