import { boundsMethods } from '../weakmaps/boundsMethods.js';


export function cameraCircleBounds() {
  this._project();
  return boundsMethods.get(this).call(this);
}
