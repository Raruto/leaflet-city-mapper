import { start } from './startWalking.js';
import { stop } from './stopWalking.js';

export function toggle() {
  if (this.saved) stop.call(this); else start.call(this);
}
