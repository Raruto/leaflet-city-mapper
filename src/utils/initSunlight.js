import { onAddSun } from './onAddSun.js';
import { onRemoveSun } from './onRemoveSun.js';

// Sun/moon clock control and sky colours; the control is created on first add (`layer.control`).
export function initSunlight(layer, options) {
  L.Util.setOptions(layer, options);
  layer.onAdd = map => onAddSun(layer, map);
  layer.onRemove = () => onRemoveSun(layer);
}