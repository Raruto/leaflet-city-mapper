import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { nativeEventMaps } from '../weakmaps/nativeEventMaps.js';
import { renderers } from '../weakmaps/renderers.js';
import { coreEventTypes } from '../globals/coreEventTypes.js';
import { nativeEventSource } from './nativeEventSource.js';
import { updateNativeHover } from './updateNativeHover.js';
import { bypassNativeEvent } from './bypassNativeEvent.js';

export function handleNativeMapEvent(event, type = event.type, targets) {
  const map = this, context = nativeEventMaps.get(map), fireDOMEvent = context.fireDOMEvent;
  const owner = renderers.get(map);
  if (!rendererByLayer.get(owner) || targets || !coreEventTypes.has(type)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  if (bypassNativeEvent(map, context, event, type)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  let source = nativeEventSource(context, event, type);
  if ((type === 'click' || type === 'preclick') && source && map._draggableMoved(source)) source = null;
  if (type === context.move || type === context.out) {
    updateNativeHover(map, context, event, source);
  }
  return fireDOMEvent.call(this, event, type, source ? /* alloc */ [source] : undefined);
}
