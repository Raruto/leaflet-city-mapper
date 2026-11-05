import { state as sharedState } from '../state.js';

import { animationPoint } from './animationPoint.js';
import { project } from './project.js';

export function mapContainerPointToLayerPoint(point) {
  return sharedState.mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
}
