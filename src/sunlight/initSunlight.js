import { onAddSun } from './onAddSun.js';
import { underEntry } from '../scene/underEntry.js';
import { initialize } from './initialize.js';
import { onAdd } from './onAdd.js';
import { addTo } from './addTo.js';
import { remove } from './remove.js';
import { onRemoveSun } from './onRemoveSun.js';

L.Control.Time = L.Control.extend({
  options: { position: 'bottomright' },
  initialize,
  onAdd,
  onRemove: onRemoveSun,
  addTo,
  remove,
});