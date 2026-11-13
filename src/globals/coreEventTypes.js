/**
 * Mouse and pointer event types eligible for native GPU hit testing.
 *
 * @type {Set<string>}
 */
export const coreEventTypes = new Set([
  'click', 'preclick', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
  'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
]);
