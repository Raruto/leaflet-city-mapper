import { mapMethods } from '../globals/mapMethods.js';


import { animationPoint } from '../projections/transformZoomAnimationPoint.js';
import { project } from '../projections/projectCameraPoint.js';

export function mapContainerPointToLayerPoint(point) {
  return mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
}
