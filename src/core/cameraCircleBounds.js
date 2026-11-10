import { boundsMethods } from '../weakmaps/boundsMethods.js';
import { projectNativePath } from './projectNativePath.js';


export function cameraCircleBounds() {
  if (this._map) projectNativePath(this);
  return boundsMethods.get(this).call(this);
}
