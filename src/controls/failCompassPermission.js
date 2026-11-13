/**
 * Disable a compass handler and emit its permission error.
 *
 * @param {Object} handler Compass handler.
 * @param {Error} error Permission or listener error.
 */
export function failCompassPermission(handler, error) {
  handler.disable();
  handler._map.fire('error', /* alloc */ { error });
}
