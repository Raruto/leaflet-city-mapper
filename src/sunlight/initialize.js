import { controlByLayer } from '../weakmaps/controlByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { L } from '../globals/L.js';


import { addTimeLayer } from './addTimeLayer.js';
import { removeTimeLayer } from './removeTimeLayer.js';

export function initialize(options) {
  L.Util.setOptions(this, options);
  this.live = true;
  this.layer = /* alloc */ new L.Layer();
  mutateWeakMap(controlByLayer, this.layer, "=", this);
  mutateWeakMap(kindByLayer, this.layer, "=", 'time');
}
