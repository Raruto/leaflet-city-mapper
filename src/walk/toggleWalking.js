import { start } from './startWalking.js';
import { stop } from './stopWalking.js';

/** Toggle the control between walk mode and the normal map view. */
export function toggle() {
  if (this.saved) stop.call(this); else start.call(this);
}
