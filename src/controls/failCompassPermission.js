export function failCompassPermission(handler, error) {
  handler.disable();
  handler._map.fire('error', /* alloc */ { error });
}
