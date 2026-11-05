import { replaceEntry } from './replaceEntry.js';

export function removeEntry() {
  this.map.off('layeradd layerremove', replaceEntry, this);
  this.element.remove();
}
