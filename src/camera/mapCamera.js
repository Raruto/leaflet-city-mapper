import { state as sharedState } from '../state.js';
import { initNativeGPU } from '../core/initNativeGPU.js';

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

sharedState.mapMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Map.prototype));

L.Map.mergeOptions({
  rotate: true, bearing: 0, pitch: 0, pitchMaxDistance: 3,
  rotateControl: true, shiftKeyRotate: true, pitchDrag: true,
  touchRotate: false, touchPitch: false, compassBearing: false,
});

// Ground coordinates only: the GPU camera handles elevated geometry, never CSS transforms.

L.Map.include({
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

sharedState.markerMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Marker.prototype));
L.Marker.mergeOptions({ rotation: 0, rotateWithView: false, keepUpright: false, scale: 1 });
L.Marker.include({
  setIcon: markerSetIcon,
  getEvents: markerGetEvents,
  _setPos: markerSetPos,
  _updateZIndex: markerUpdateZIndex,
  _initInteraction: markerInitInteraction,
});

// Keep Leaflet's focusable marker and its drag events; only translate its screen position back to ground.

sharedState.popupEvents = L.Popup.prototype.getEvents;
L.Popup.include({
  getEvents: popupGetEvents,
});
sharedState.tooltipEvents = L.Tooltip.prototype.getEvents;
L.Tooltip.include({
  getEvents: tooltipGetEvents,
});
sharedState.popupPosition = L.Popup.prototype._updatePosition;
sharedState.popupPan = L.Popup.prototype._adjustPan;
L.Popup.include({
  _adjustPan: popupAdjustPan,
  _updatePosition: popupUpdatePosition,
});
sharedState.tooltipPosition = L.Tooltip.prototype._setPosition;
L.Tooltip.include({
  _setPosition: tooltipSetPosition,
});

sharedState.tiledBounds = L.GridLayer.prototype._getTiledPixelBounds;
sharedState.gridEvents = L.GridLayer.prototype.getEvents;
L.GridLayer.include({
  getEvents: gridlayerGetEvents,
  _getTiledPixelBounds: gridlayerGetTiledPixelBounds,
});
