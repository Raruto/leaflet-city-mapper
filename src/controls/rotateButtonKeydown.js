import { mapSetBearing } from '../camera/mapSetBearing.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapSetPitch } from '../camera/mapSetPitch.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
export function rotateButtonKeydown(event) {
  const control = this._rotateControl, map = control._map, step = event.shiftKey ? 15 : 5;
  if (event.key === 'ArrowLeft') mapSetBearing(map, mapGetBearing(map) - step);
  else if (event.key === 'ArrowRight') mapSetBearing(map, mapGetBearing(map) + step);
  else if (event.key === 'ArrowUp' && control.options.visualizePitch) mapSetPitch(map, mapGetPitch(map) + step);
  else if (event.key === 'ArrowDown' && control.options.visualizePitch) mapSetPitch(map, mapGetPitch(map) - step);
  else if (event.key === 'Home' || event.key === ' ') this.click();
  else return;
  event.preventDefault();
  event.stopPropagation();
}
