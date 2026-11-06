import { mapMethods } from '../globals/mapMethods.js';

import { project } from '../projections/projectCameraPoint.js';
import { animationPoint } from '../projections/transformZoomAnimationPoint.js';

export function mapLayerPointToContainerPoint(point) {
  return project(this, animationPoint(this, mapMethods.value.layerPointToContainerPoint.call(this, point)));
}
