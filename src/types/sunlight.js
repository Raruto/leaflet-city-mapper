import { onAddSun } from '../utils/onAddSun.js';
import { onRemoveSun } from '../utils/onRemoveSun.js';

// Sun/moon clock control and sky colours; the control is created on first add (`layer.control`).
L.Layer.types.sunlight = L.Layer.extend({
  onAdd(map) { return onAddSun(this, map); },
  onRemove() { return onRemoveSun(this); },
});