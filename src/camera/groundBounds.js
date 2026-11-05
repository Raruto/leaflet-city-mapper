import { pointOf } from './pointOf.js';
import { project } from './project.js';
import { state as sharedState } from '../state.js';

export function groundBounds(map, padding = sharedState.allocationCameraZeroPadding) {
  const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
  const bounds = /* allocation: required -- The returned native bounds owns its independent projected corners. */ new L.Bounds();
  const minX = min.x, minY = min.y;
  let i;
  for (i = 0; i < 4; i++) {
    min.x = i % 2 ? max.x : minX;
    min.y = i < 2 ? minY : max.y;
    bounds.extend(project(map, min, true, true));
  }
  return bounds;
}
