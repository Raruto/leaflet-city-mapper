import { eventMapByLayer } from '../weakmaps/eventMapByLayer.js';
import { eventsByLayer } from '../weakmaps/eventsByLayer.js';




export function removeLayerEvents() {

  eventMapByLayer.get(this).off(eventsByLayer.get(this), this);
  eventMapByLayer.set(this, null);
  eventsByLayer.set(this, null);
}
