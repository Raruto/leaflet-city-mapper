import { addTimeLayer } from './addTimeLayer.js';
import { removeTimeLayer } from './removeTimeLayer.js';

export function initialize(options) {
  L.Util.setOptions(this, options);
  this.live = true;
  this.layer = new L.Layer();
  this.layer.control = this;
  this.layer.onAdd = addTimeLayer;
  this.layer.onRemove = removeTimeLayer;
}
