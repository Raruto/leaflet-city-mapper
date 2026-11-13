import { cameraFocusOptions } from '../globals/cameraFocusOptions.js';
import { mapResetNorthPitch } from '../camera/mapResetNorthPitch.js';
import { mapResetNorth } from '../camera/mapResetNorth.js';

/**
 * Reset bearing and optionally pitch from the rotate control button.
 *
 * @param {MouseEvent} event Button click event.
 */
export function rotateButtonClick(event) {
  const control = this._rotateControl, map = control._map;
  event.preventDefault();
  if (control.options.visualizePitch) mapResetNorthPitch(map);
  else mapResetNorth(map);
  if (event.detail) map.getContainer().focus(cameraFocusOptions);
}
