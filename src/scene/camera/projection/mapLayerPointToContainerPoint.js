import { project } from './project.js';
import { animationPoint } from '../animation/animationPoint.js';
import { mapCameraState } from '../constants/mapCameraState.js';

export function mapLayerPointToContainerPoint(point) {
  return project(this, animationPoint(this, mapCameraState.mapMethods.layerPointToContainerPoint.call(this, point)));
}
