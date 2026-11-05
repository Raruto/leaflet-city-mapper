import { initNativeGPU } from '../leaflet-core/initNativeGPU.js';
import { mapCameraState } from './constants/mapCameraState.js';
import { mapGetBearing } from './mapGetBearing.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapStopPitchBearingAnimation } from './animation/mapStopPitchBearingAnimation.js';
import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';
import { mapAnimateCamera } from './animation/mapAnimateCamera.js';
import { mapSetBearing } from './mapSetBearing.js';
import { mapSetPitch } from './mapSetPitch.js';
import { mapResetNorth } from './mapResetNorth.js';
import { mapResetNorthPitch } from './mapResetNorthPitch.js';
import { mapLayerPointToContainerPoint } from './projection/mapLayerPointToContainerPoint.js';
import { mapContainerPointToLayerPoint } from './projection/mapContainerPointToLayerPoint.js';
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
import { markerSetIcon } from '../leaflet-core/markers/markerSetIcon.js';
import { markerSetRotation } from '../leaflet-core/markers/markerSetRotation.js';
import { markerCameraIconPoint } from '../leaflet-core/markers/markerCameraIconPoint.js';
import { markerGetEvents } from '../leaflet-core/markers/markerGetEvents.js';
import { markerSetPos } from '../leaflet-core/markers/markerSetPos.js';
import { markerUpdateZIndex } from '../leaflet-core/markers/markerUpdateZIndex.js';
import { markerInitInteraction } from '../leaflet-core/markers/markerInitInteraction.js';
import { popupGetEvents } from '../leaflet-core/overlays/popupGetEvents.js';
import { tooltipGetEvents } from '../leaflet-core/overlays/tooltipGetEvents.js';
import { popupAdjustPan } from '../leaflet-core/overlays/popupAdjustPan.js';
import { popupUpdatePosition } from '../leaflet-core/overlays/popupUpdatePosition.js';
import { tooltipSetPosition } from '../leaflet-core/overlays/tooltipSetPosition.js';
import { gridlayerGetEvents } from '../leaflet-core/tiles/gridlayerGetEvents.js';
import { gridlayerGetTiledPixelBounds } from '../leaflet-core/tiles/gridlayerGetTiledPixelBounds.js';

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
