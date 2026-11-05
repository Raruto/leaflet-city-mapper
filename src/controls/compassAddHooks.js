import { compassOrientation } from './compassOrientation.js';
import { finishCompassPermission } from './finishCompassPermission.js';

export function compassAddHooks() {
  this._compassGeneration = (this._generation = (this._generation || 0) + 1);
  this._orientation = /* alloc */ { handler: this, handleEvent: compassOrientation };
  const permission = window.DeviceOrientationEvent?.requestPermission;
  let request;
  try {
    request = permission ? permission.call(window.DeviceOrientationEvent) : 'granted';
  } catch (error) {
    request = Promise.reject(error);
  }
  Promise.allSettled(/* alloc */ [
    Promise.resolve(/* alloc */ { handler: this, generation: this._generation }),
    request,
  ]).then(finishCompassPermission);
}
