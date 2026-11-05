import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
export function refreshRotateControl() {
  const map = this._map, pitch = this.options.visualizePitch ? mapGetPitch(map) : 0;
  this._arrow.style.transform = `scale(${1 / Math.sqrt(Math.cos(pitch * Math.PI / 180))}) rotateX(${pitch}deg) rotate(${mapGetBearing(map)}deg)`;
  this._button.setAttribute('aria-description', `Bearing ${Math.round(mapGetBearing(map))} degrees, pitch ${Math.round(mapGetPitch(map))} degrees. Arrow keys adjust the camera; Home resets it.`);
  this._container.style.display = this.options.closeOnZeroBearing && !mapGetBearing(map) && !pitch &&
    !this._container.contains(document.activeElement) ? 'none' : '';
}
