import { closestMethods } from '../weakmaps/closestMethods.js';
import { projectNativePath } from './projectNativePath.js';


export function closestCameraLayerPoint(point) {
  projectNativePath(this);
  this._parts = this._rings;
  return closestMethods.get(this).call(this, point);
}
