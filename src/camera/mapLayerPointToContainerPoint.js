import { mapMethods } from '../globals/mapMethods.js';

import { project } from './project.js';
import { animationPoint } from './animationPoint.js';

export function mapLayerPointToContainerPoint(point) {
  return project(this, animationPoint(this, mapMethods.value.layerPointToContainerPoint.call(this, point)));
}
