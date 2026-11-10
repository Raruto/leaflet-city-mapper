import { L } from '../globals/L.js';
import { mapMethods } from '../globals/mapMethods.js';
import { markerMethods } from '../globals/markerMethods.js';
import { popupEvents } from '../globals/popupEvents.js';
import { tooltipEvents } from '../globals/tooltipEvents.js';
import { popupPosition } from '../globals/popupPosition.js';
import { popupPan } from '../globals/popupPan.js';
import { tooltipPosition } from '../globals/tooltipPosition.js';
import { tiledBounds } from '../globals/tiledBounds.js';
import { gridEvents } from '../globals/gridEvents.js';

import { initNativeGPU } from '../native/initNativeGPU.js';

import { mapLayerPointToContainerPoint } from './mapLayerPointToContainerPoint.js';
import { mapContainerPointToLayerPoint } from './mapContainerPointToLayerPoint.js';
import { mapGetCenterLayerPoint } from './mapGetCenterLayerPoint.js';
import { mapPanBy } from './mapPanBy.js';
import { mapSetZoomAround } from './mapSetZoomAround.js';
import { mapPanInside } from './mapPanInside.js';
import { mapLimitCenter } from './mapLimitCenter.js';
import { mapLimitOffset } from './mapLimitOffset.js';
import { mapGetBoundsCenterZoom } from './mapGetBoundsCenterZoom.js';
import { mapGetBoundsZoom } from './mapGetBoundsZoom.js';
import { mapTryAnimatedPan } from './mapTryAnimatedPan.js';
import { mapGetBounds } from './mapGetBounds.js';
import { initializeCameraMap } from './initializeCameraMap.js';
import { markerSetIcon } from '../core/markerSetIcon.js';
import { markerGetEvents } from '../core/markerGetEvents.js';
import { markerSetPos } from '../core/markerSetPos.js';
import { markerUpdateZIndex } from '../core/markerUpdateZIndex.js';
import { markerInitInteraction } from '../core/markerInitInteraction.js';
import { popupGetEvents } from '../core/popupGetEvents.js';
import { tooltipGetEvents } from '../core/tooltipGetEvents.js';
import { popupAdjustPan } from '../core/popupAdjustPan.js';
import { popupUpdatePosition } from '../core/popupUpdatePosition.js';
import { tooltipSetPosition } from '../core/tooltipSetPosition.js';
import { gridlayerGetEvents } from '../core/gridlayerGetEvents.js';
import { gridlayerGetTiledPixelBounds } from '../core/gridlayerGetTiledPixelBounds.js';

mapMethods.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Map.prototype));

L.Map.mergeOptions({
  rotate: true, bearing: 0, pitch: 0, maxPitch: 85, pitchMaxDistance: 3,
  rotateControl: true, shiftKeyRotate: true, pitchDrag: true,
  touchRotate: false, touchPitch: false, compassBearing: false,
});

// Ground coordinates only: the GPU camera handles elevated geometry, never CSS transforms.

Object.assign(L.Map.prototype, {
  layerPointToContainerPoint: mapLayerPointToContainerPoint,
  containerPointToLayerPoint: mapContainerPointToLayerPoint,
  _getCenterLayerPoint: mapGetCenterLayerPoint,
  panBy: mapPanBy,
  setZoomAround: mapSetZoomAround,
  panInside: mapPanInside,
  _limitCenter: mapLimitCenter,
  _limitOffset: mapLimitOffset,
  _getBoundsCenterZoom: mapGetBoundsCenterZoom,
  getBoundsZoom: mapGetBoundsZoom,
  _tryAnimatedPan: mapTryAnimatedPan,
  getBounds: mapGetBounds,
});

L.Map.addInitHook(initializeCameraMap);

markerMethods.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Marker.prototype));
L.Marker.mergeOptions({ rotation: 0, rotateWithView: false, keepUpright: false, scale: 1 });
Object.assign(L.Marker.prototype, {
  setIcon: markerSetIcon,
  getEvents: markerGetEvents,
  _setPos: markerSetPos,
  _updateZIndex: markerUpdateZIndex,
  _initInteraction: markerInitInteraction,
});

// Keep Leaflet's focusable marker and its drag events; only translate its screen position back to ground.

popupEvents.value = L.Popup.prototype.getEvents;
Object.assign(L.Popup.prototype, {
  getEvents: popupGetEvents,
});
tooltipEvents.value = L.Tooltip.prototype.getEvents;
Object.assign(L.Tooltip.prototype, {
  getEvents: tooltipGetEvents,
});
popupPosition.value = L.Popup.prototype._updatePosition;
popupPan.value = L.Popup.prototype._adjustPan;
Object.assign(L.Popup.prototype, {
  _adjustPan: popupAdjustPan,
  _updatePosition: popupUpdatePosition,
});
tooltipPosition.value = L.Tooltip.prototype._setPosition;
Object.assign(L.Tooltip.prototype, {
  _setPosition: tooltipSetPosition,
});

tiledBounds.value = L.GridLayer.prototype._getTiledPixelBounds;
gridEvents.value = L.GridLayer.prototype.getEvents;
Object.assign(L.GridLayer.prototype, {
  getEvents: gridlayerGetEvents,
  _getTiledPixelBounds: gridlayerGetTiledPixelBounds,
});
