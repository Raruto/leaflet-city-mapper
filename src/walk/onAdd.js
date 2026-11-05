import { pluginState } from '../core/pluginState.js';
export function onAdd(map) {
  this._walk.layer.addTo(map);
  return pluginState(this._walk).container;
}
