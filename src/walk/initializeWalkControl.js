import { L } from '../globals/L.js';
import { createWalk } from './createWalk.js';

export function initialize(options) {
  L.Util.setOptions(this, options);
  createWalk(this, this.options);
}
