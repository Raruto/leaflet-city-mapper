import { controlByLayer } from '../weakmaps/controlByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { L } from '../globals/L.js';
import { addTimeLayer } from './addTimeLayer.js';
import { removeTimeLayer } from './removeTimeLayer.js';

/**
 * Apply time-control options and create its associated time layer.
 *
 * @param {Object} options Time control options.
 */
export function initialize(options) {
  L.Util.setOptions(this, options);
  this.live = true;
  this.layer = /* alloc */ new L.Layer();
  controlByLayer.set(this.layer, this);
  kindByLayer.set(this.layer, 'time');
}
