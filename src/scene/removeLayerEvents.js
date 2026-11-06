import { eventMapByLayer } from '../weakmaps/eventMapByLayer.js';
import { eventsByLayer } from '../weakmaps/eventsByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';




export function removeLayerEvents() {

  eventMapByLayer.get(this).off(eventsByLayer.get(this), this);
  mutateWeakMap(eventsByLayer, this, "=", mutateWeakMap(eventMapByLayer, this, "=", null));
}
