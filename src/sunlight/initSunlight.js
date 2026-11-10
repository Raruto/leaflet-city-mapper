import { L } from '../globals/L.js';
import { onAddSun } from './onAddSun.js';
import { underEntry } from '../layer-controls/underEntry.js';
import { initialize } from './initializeTimeControl.js';
import { onAdd } from './onAddTimeControl.js';
import { addTo } from './addTimeControlToMap.js';
import { remove } from './removeTimeControl.js';
import { onRemoveSun } from './onRemoveSun.js';
import { extendLeafletClass } from '../core/extendLeafletClass.js';

class TimeControl extends extendLeafletClass(L.Control) {
  static initHooks = true;
  static defaultOptions = { position: 'bottomright' };

  constructor(options) {
    super(options);
    if (L.version.startsWith('2.')) {
      initialize.call(this, options);
      this.callInitHooks();
    }
  }
}
Object.assign(TimeControl.prototype, { onAdd, onRemove: onRemoveSun, addTo, remove });
if (L.version.startsWith('1.')) {
  TimeControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), TimeControl.defaultOptions);
  TimeControl.prototype.initialize = initialize;
}
L.Control.Time = TimeControl;