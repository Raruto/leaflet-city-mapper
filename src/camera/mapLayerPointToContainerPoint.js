import { state as sharedState } from '../state.js';
import { project } from './project.js';
import { animationPoint } from './animationPoint.js';

export function mapLayerPointToContainerPoint(point) {
  return project(this, animationPoint(this, sharedState.mapMethods.layerPointToContainerPoint.call(this, point)));
}
