import { L } from '../globals/L.js';
import { nativeEventMaps } from '../globals/nativeEventMaps.js';


import { raycast } from '../picking/raycast.js';

import { restoreNativeEvents } from './restoreNativeEvents.js';
import { handleNativeMapEvent } from './handleNativeMapEvent.js';

/** One GPU hit test per map event, rather than one invisible SVG path per feature. */
export function nativeEvents(state) {
  const { map } = state;
  let context = nativeEventMaps.get(map);
  if (!context) {
    context = /* alloc */ {
      map, states: /* alloc */ new Set(), hovered: null,
    };
    const pointer = L.version.startsWith('2');
    context.move = pointer ? 'pointermove' : 'mousemove';
    context.out = pointer ? 'pointerout' : 'mouseout';
    context.over = pointer ? 'pointerover' : 'mouseover';
    context.descriptor = Object.getOwnPropertyDescriptor(map, '_fireDOMEvent');
    context.fireDOMEvent = map._fireDOMEvent;
    context.handle = handleNativeMapEvent;
    context.restore = restoreNativeEvents;
    nativeEventMaps.set(map, context);
    map._fireDOMEvent = handleNativeMapEvent;
  }
  context.states.add(state);
  state._nativeEventContext = context;
}
