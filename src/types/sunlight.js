import { onAddSun } from '../utils/onAddSun.js';
import { onRemoveSun } from '../utils/onRemoveSun.js';

// Sun/moon clock control and sky colours; the control is created on first add (`layer.control`).
L.Layer.types.sunlight = (layer, options) => {
  L.Util.setOptions(layer, options);
  layer.onAdd = map => onAddSun(layer, map);
  layer.onRemove = () => onRemoveSun(layer);
};