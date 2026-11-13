import { radians } from '../globals/radians.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

/** Update this rotate control's arrow, accessible description and visibility. */
export function refreshRotateControl() {
  const map = this._map, pitch = this.options.visualizePitch ? mapGetPitch(map) : 0;
  this._arrow.style.transform = `scale(${1 / Math.sqrt(Math.max(0.01, Math.abs(Math.cos(pitch * radians))))}) rotateX(${pitch}deg) rotate(${mapGetBearing(map)}deg)`;
  this._button.setAttribute('aria-description', `Bearing ${Math.round(mapGetBearing(map))} degrees, pitch ${Math.round(mapGetPitch(map))} degrees. Arrow keys adjust the camera; Home resets it.`);
  this._container.style.display = this.options.closeOnZeroBearing && !mapGetBearing(map) && !pitch &&
    !this._container.contains(document.activeElement) ? 'none' : '';
}
