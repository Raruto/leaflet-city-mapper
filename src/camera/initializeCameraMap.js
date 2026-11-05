import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';
import { pluginState } from '../core/pluginState.js';
import { updateSky } from './updateSky.js';
import { constrainCameraToBounds } from './constrainCameraToBounds.js';
import { cleanupCameraMap } from './cleanupCameraMap.js';
import { cameraMapReady } from './cameraMapReady.js';
import { loadCameraControls } from '../controls/loadCameraControls.js';
import { noOperation } from '../utils/noOperation.js';

export function initializeCameraMap() {
  if (!document.getElementById('leaflet-camera-zoom-style')) {
    const style = document.createElement('style');
    style.id = 'leaflet-camera-zoom-style';
    style.textContent = '.leaflet-camera-zoom .leaflet-marker-icon,.leaflet-camera-zoom .leaflet-marker-shadow,' +
      '.leaflet-camera-zoom .leaflet-popup,.leaflet-camera-zoom .leaflet-tooltip{transition:none!important}';
    document.head.append(style);
  }
  mapSetPitchAndBearing(this, this.options.pitch, this.options.bearing);
  this.on('load resize pitch', updateSky);
  this.on('rotate pitch', constrainCameraToBounds, this);
  this.once('unload', cleanupCameraMap, this);
  this.whenReady(cameraMapReady, this);
  if (this.options.rotate || this.options.trackContainerMutation) {
    pluginState(this).cameraReady = loadCameraControls(this);
    pluginState(this).cameraReady.catch(noOperation);
  }
}
