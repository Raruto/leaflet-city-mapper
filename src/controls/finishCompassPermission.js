export function finishCompassPermission([handlerResult, permissionResult]) {
  const { handler, generation } = handlerResult.value;
  try {
    if (!handler.enabled() || handler._generation !== generation) return;
    if (!window.DeviceOrientationEvent || permissionResult.status !== 'fulfilled' ||
      permissionResult.value !== 'granted') {
      throw permissionResult.status === 'rejected' ? permissionResult.reason :
        /* allocation: required -- Report this rejected permission attempt with its own stack. */ new Error('Device compass permission unavailable or denied');
    }
    window.addEventListener('deviceorientation', handler._orientation);
    window.addEventListener('deviceorientationabsolute', handler._orientation);
  } catch (error) {
    handler.disable();
    handler._map.fire('error', /* allocation: required -- Error listeners may retain or mutate this permission event. */ { error });
  }
}
