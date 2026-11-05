import { mapMethods } from '../globals/mapMethods.js';

import { project } from './project.js';
import { pointOf } from './pointOf.js';

export function mapPanBy(offset, options) {
  const half = this.getSize().divideBy(2);
  const ground = half.subtract(project(this, half.subtract(pointOf(offset)), true));
  return mapMethods.value.panBy.call(this, ground, options);
}
