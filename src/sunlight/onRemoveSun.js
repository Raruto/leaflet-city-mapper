import { sunlightByControl } from '../weakmaps/sunlightByControl.js';
import { removeSun } from './removeSun.js';

/** Remove the current time control's sunlight state and association. */
export function onRemoveSun() {
  const sunlight = sunlightByControl.get(this);
  if (!sunlight) return;
  removeSun(sunlight);
  sunlightByControl.delete(this);
}
