import { mapResetNorthPitch } from '../camera/mapResetNorthPitch.js';
import { mapResetNorth } from '../camera/mapResetNorth.js';
import { state as sharedState } from '../state.js';
export function rotateButtonClick(event) {
  const control = this._rotateControl, map = control._map;
  event.preventDefault();
  if (control.options.visualizePitch) mapResetNorthPitch(map);
  else mapResetNorth(map);
  if (event.detail) map.getContainer().focus(sharedState.allocationCameraFocusOptions);
}
