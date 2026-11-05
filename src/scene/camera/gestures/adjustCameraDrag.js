import { project } from '../projection/project.js';

export function adjustCameraDrag() {
  const map = this;
  const draggable = map._cameraDraggable;
  if (!map.getPitch() && !map.getBearing()) return;
  const half = map.getSize().divideBy(2), delta = draggable._newPos.subtract(draggable._startPos);
  const ground = half.subtract(project(map, half.subtract(delta), true));
  draggable._newPos = draggable._startPos.add(ground);
}
