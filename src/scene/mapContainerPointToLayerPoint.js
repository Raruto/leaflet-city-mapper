import { mapCameraState } from './constants/mapCameraState.js';
import { animationPoint } from './animationPoint.js';
import { project } from './project.js';

export function mapContainerPointToLayerPoint(point) {
  return mapCameraState.mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
}
