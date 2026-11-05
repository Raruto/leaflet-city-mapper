import { mapCameraState } from '../constants/mapCameraState.js';
import { project } from './project.js';

export function mapLimitOffset(offset, bounds) {
  if (!bounds || !this.getPitch() && !this.getBearing()) return mapCameraState.mapMethods._limitOffset.call(this, offset, bounds);
  const half = this.getSize().divideBy(2), ground = half.subtract(project(this, half.subtract(offset), true));
  const center = this.project(this.getCenter());
  const limited = this.project(this._limitCenter(this.unproject(center.add(ground)), this.getZoom(), bounds));
  return half.subtract(project(this, half.subtract(limited.subtract(center))));
}
