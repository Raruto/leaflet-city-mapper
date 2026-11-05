import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { addTimeLayer } from './addTimeLayer.js';
import { removeTimeLayer } from './removeTimeLayer.js';

export function initialize(options) {
  L.Util.setOptions(this, options);
  this.live = true;
  this.layer = /* allocation: required -- Each time control needs its own removable Leaflet layer. */ new L.Layer();
  sceneByLayer.get(this.layer).control = this;
  sceneByLayer.get(this.layer).kind = 'time';
}
