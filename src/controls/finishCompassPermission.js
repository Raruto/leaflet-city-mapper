import { failCompassPermission } from './failCompassPermission.js';

/**
 * Install compass listeners if the current permission request succeeded.
 *
 * @param {Array<Object>} results Settled handler-generation and permission results.
 *
 * @returns {*} Permission failure handler result when permission is unavailable or denied.
 */
export function finishCompassPermission([handlerResult, permissionResult]) {
  const { handler, generation } = handlerResult.value;
  if (!handler.enabled() || handler._generation !== generation) return;
  if (!window.DeviceOrientationEvent || permissionResult.status !== 'fulfilled' ||
    permissionResult.value !== 'granted') {
    return failCompassPermission(handler, permissionResult.status === 'rejected' ? permissionResult.reason :
      /* alloc */ new Error('Device compass permission unavailable or denied'));
  }
  try {
    window.addEventListener('deviceorientation', handler._orientation);
    window.addEventListener('deviceorientationabsolute', handler._orientation);
  } catch (error) {
    failCompassPermission(handler, error);
  }
}
