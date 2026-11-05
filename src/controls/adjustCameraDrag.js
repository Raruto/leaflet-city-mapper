import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { pluginState } from '../core/pluginState.js';
import { project } from '../camera/project.js';

export function adjustCameraDrag() {
  const map = this;
  const draggable = pluginState(map)._cameraDraggable;
  if (!mapGetPitch(map) && !mapGetBearing(map)) return;
  const half = map.getSize().divideBy(2), delta = draggable._newPos.subtract(draggable._startPos);
  const ground = half.subtract(project(map, half.subtract(delta), true));
  draggable._newPos = draggable._startPos.add(ground);
}
