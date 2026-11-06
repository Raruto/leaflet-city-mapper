import { L } from '../globals/L.js';
import { onAddSun } from './onAddSun.js';
import { underEntry } from '../layer-controls/underEntry.js';
import { initialize } from './initializeTimeControl.js';
import { onAdd } from './onAddTimeControl.js';
import { addTo } from './addTimeControlToMap.js';
import { remove } from './removeTimeControl.js';
import { onRemoveSun } from './onRemoveSun.js';

L.Control.Time = L.Control.extend({
  options: { position: 'bottomright' },
  initialize,
  onAdd,
  onRemove: onRemoveSun,
  addTo,
  remove,
});