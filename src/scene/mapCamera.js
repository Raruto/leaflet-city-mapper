import { initNativeGPU } from './initNativeGPU.js';
import { mapCameraState } from './constants/mapCameraState.js';
import { mapGetBearing } from './mapGetBearing.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapStopPitchBearingAnimation } from './mapStopPitchBearingAnimation.js';
import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';
import { mapAnimateCamera } from './mapAnimateCamera.js';
import { mapSetBearing } from './mapSetBearing.js';
import { mapSetPitch } from './mapSetPitch.js';
import { mapResetNorth } from './mapResetNorth.js';
import { mapResetNorthPitch } from './mapResetNorthPitch.js';
import { mapLayerPointToContainerPoint } from './mapLayerPointToContainerPoint.js';
import { mapContainerPointToLayerPoint } from './mapContainerPointToLayerPoint.js';
import { mapGetCenterLayerPoint } from './mapGetCenterLayerPoint.js';
import { mapUpdateCameraOverlays } from './mapUpdateCameraOverlays.js';
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
import { markerSetIcon } from './markerSetIcon.js';
import { markerSetRotation } from './markerSetRotation.js';
import { markerCameraIconPoint } from './markerCameraIconPoint.js';
import { markerGetEvents } from './markerGetEvents.js';
import { markerSetPos } from './markerSetPos.js';
import { markerUpdateZIndex } from './markerUpdateZIndex.js';
import { markerInitInteraction } from './markerInitInteraction.js';
import { popupGetEvents } from './popupGetEvents.js';
import { tooltipGetEvents } from './tooltipGetEvents.js';
import { popupAdjustPan } from './popupAdjustPan.js';
import { popupUpdatePosition } from './popupUpdatePosition.js';
import { tooltipSetPosition } from './tooltipSetPosition.js';
import { gridlayerGetEvents } from './gridlayerGetEvents.js';
import { gridlayerGetTiledPixelBounds } from './gridlayerGetTiledPixelBounds.js';

mapCameraState.mapMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Map.prototype));
mapCameraState.radians = Math.PI / 180;

mapCameraState.cameraAnimations = new Map();
mapCameraState.cameraAnimationFrame = null;

L.Map.mergeOptions({
  rotate: true, bearing: 0, pitch: 0, pitchMaxDistance: 3,
  rotateControl: true, shiftKeyRotate: true, pitchDrag: true,
  touchRotate: false, touchPitch: false, compassBearing: false,
});

// Ground coordinates only: the GPU camera handles elevated geometry, never CSS transforms.

L.Map.include({
  getBearing: mapGetBearing,
  getPitch: mapGetPitch,
  _stopPitchBearingAnimation: mapStopPitchBearingAnimation,
  _setPitchAndBearing: mapSetPitchAndBearing,
  _animateCamera: mapAnimateCamera,
  setBearing: mapSetBearing,
  setPitch: mapSetPitch,
  resetNorth: mapResetNorth,
  resetNorthPitch: mapResetNorthPitch,
  layerPointToContainerPoint: mapLayerPointToContainerPoint,
  containerPointToLayerPoint: mapContainerPointToLayerPoint,
  _getCenterLayerPoint: mapGetCenterLayerPoint,
  _updateCameraOverlays: mapUpdateCameraOverlays,
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

mapCameraState.markerMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Marker.prototype));
L.Marker.mergeOptions({ rotation: 0, rotateWithView: false, keepUpright: false, scale: 1 });
L.Marker.include({
  setIcon: markerSetIcon,
  setRotation: markerSetRotation,
  _cameraIconPoint: markerCameraIconPoint,
  getEvents: markerGetEvents,
  _setPos: markerSetPos,
  _updateZIndex: markerUpdateZIndex,
  _initInteraction: markerInitInteraction,
});

// Keep Leaflet's focusable marker and its drag events; only translate its screen position back to ground.

mapCameraState.pendingMarkerPan = new Map();
mapCameraState.markerPanFrame = null;

mapCameraState.popupEvents = L.Popup.prototype.getEvents;
L.Popup.include({
  getEvents: popupGetEvents,
});
mapCameraState.tooltipEvents = L.Tooltip.prototype.getEvents;
L.Tooltip.include({
  getEvents: tooltipGetEvents,
});
mapCameraState.popupPosition = L.Popup.prototype._updatePosition;
mapCameraState.popupPan = L.Popup.prototype._adjustPan;
L.Popup.include({
  _adjustPan: popupAdjustPan,
  _updatePosition: popupUpdatePosition,
});
mapCameraState.tooltipPosition = L.Tooltip.prototype._setPosition;
L.Tooltip.include({
  _setPosition: tooltipSetPosition,
});

mapCameraState.tiledBounds = L.GridLayer.prototype._getTiledPixelBounds;
mapCameraState.gridEvents = L.GridLayer.prototype.getEvents;
L.GridLayer.include({
  getEvents: gridlayerGetEvents,
  _getTiledPixelBounds: gridlayerGetTiledPixelBounds,
});
