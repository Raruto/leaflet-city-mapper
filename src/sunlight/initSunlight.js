import { L } from '../globals/L.js';
import { onAddSun } from './onAddSun.js';
import { underEntry } from '../layer-controls/underEntry.js';
import { initialize } from './initializeTimeControl.js';
import { onAdd } from './onAddTimeControl.js';
import { addTo } from './addTimeControlToMap.js';
import { remove } from './removeTimeControl.js';
import { onRemoveSun } from './onRemoveSun.js';

class TimeControl extends L.Control {
  static defaultOptions = { position: 'bottomright' };

  constructor(options) {
    super(options);
    if (L.version.startsWith('2.')) initialize.call(this, options);
  }
}
Object.assign(TimeControl.prototype, { onAdd, onRemove: onRemoveSun, addTo, remove });
if (L.version.startsWith('1.')) {
  TimeControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), TimeControl.defaultOptions);
  TimeControl.prototype.initialize = initialize;
}
L.Control.Time = TimeControl;