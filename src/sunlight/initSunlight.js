import { onAddSun } from './onAddSun.js';
import { underEntry } from '../scene/graph/underEntry.js';
import { initialize } from './initialize.js';
import { onAdd } from './onAdd.js';
import { addTo } from './addTo.js';
import { remove } from './remove.js';

L.Control.Time = L.Control.extend({
  options: { position: 'bottomright' },
  initialize,
  onAdd,
  addTo,
  remove,
});