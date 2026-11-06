import { L } from '../globals/L.js';
import { cameraZeroPadding } from '../globals/cameraZeroPadding.js';
import { pointOf } from './toPoint.js';
import { project } from './projectCameraPoint.js';


export function groundBounds(map, padding = cameraZeroPadding) {
  const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
  const bounds = /* alloc */ new L.Bounds();
  const minX = min.x, minY = min.y;
  let i;
  for (i = 0; i < 4; i++) {
    min.x = i % 2 ? max.x : minX;
    min.y = i < 2 ? minY : max.y;
    bounds.extend(project(map, min, true, true));
  }
  return bounds;
}
