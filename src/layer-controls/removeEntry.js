import { replaceEntry } from './replaceEntry.js';

/** Remove the tracked element, its map listener and any empty traffic status group. */
export function removeEntry() {
  this.map.off('layeradd layerremove', replaceEntry, this);
  const group = this.element.parentElement;
  this.element.remove();
  if (group?.classList.contains('traffic-status-group') && !group.childElementCount) group.remove();
}
