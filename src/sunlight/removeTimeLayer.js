import { controlByLayer } from '../weakmaps/controlByLayer.js';

import { L } from '../globals/L.js';


export function removeTimeLayer() {
  return L.Control.prototype.remove.call(controlByLayer.get(this));
}
