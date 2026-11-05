import { mapMethods } from '../globals/mapMethods.js';


import { animationPoint } from './animationPoint.js';
import { project } from './project.js';

export function mapContainerPointToLayerPoint(point) {
  return mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
}
