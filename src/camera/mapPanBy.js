import { project } from './project.js';
import { pointOf } from './pointOf.js';
import { mapCameraState } from '../constants/mapCameraState.js';

export function mapPanBy(offset, options) {
  const half = this.getSize().divideBy(2);
  const ground = half.subtract(project(this, half.subtract(pointOf(offset)), true));
  return mapCameraState.mapMethods.panBy.call(this, ground, options);
}
