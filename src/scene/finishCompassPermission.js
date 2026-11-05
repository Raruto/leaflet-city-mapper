export function finishCompassPermission([handlerResult, permissionResult]) {
  const { handler, generation } = handlerResult.value;
  try {
    if (!handler.enabled() || handler._generation !== generation) return;
    if (!window.DeviceOrientationEvent || permissionResult.status !== 'fulfilled' ||
      permissionResult.value !== 'granted') {
      throw permissionResult.status === 'rejected' ? permissionResult.reason :
        new Error('Device compass permission unavailable or denied');
    }
    window.addEventListener('deviceorientation', handler._orientation);
    window.addEventListener('deviceorientationabsolute', handler._orientation);
  } catch (error) {
    handler.disable();
    handler._map.fire('error', { error });
  }
}
