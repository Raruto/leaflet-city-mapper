import { pluginState } from '../core/pluginState.js';
import { addTimeLayer } from './addTimeLayer.js';
import { removeTimeLayer } from './removeTimeLayer.js';

export function initialize(options) {
  L.Util.setOptions(this, options);
  this.live = true;
  this.layer = /* allocation: required -- Each time control needs its own removable Leaflet layer. */ new L.Layer();
  pluginState(this.layer).control = this;
  pluginState(this.layer).onAdd = addTimeLayer;
  pluginState(this.layer).onRemove = removeTimeLayer;
}
