import { start } from './start.js';
import { stop } from './stop.js';

export function toggle() {
  if (this.saved) stop.call(this); else start.call(this);
}
