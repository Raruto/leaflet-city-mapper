import { compassOrientation } from './compassOrientation.js';
import { finishCompassPermission } from './finishCompassPermission.js';

export function compassAddHooks() {
  this._compassGeneration = (this._generation = (this._generation || 0) + 1);
  this._orientation = /* allocation: required -- The registered orientation listener retains this handler identity. */ { handler: this, handleEvent: compassOrientation };
  const permission = window.DeviceOrientationEvent?.requestPermission;
  let request;
  try {
    request = permission ? permission.call(window.DeviceOrientationEvent) : 'granted';
  } catch (error) {
    request = Promise.reject(error);
  }
  Promise.allSettled(/* allocation: required -- Each asynchronous permission attempt pairs its own context and result. */ [
    Promise.resolve(/* allocation: required -- Pending permission attempts need immutable handler generation snapshots. */ { handler: this, generation: this._generation }),
    request,
  ]).then(finishCompassPermission);
}
