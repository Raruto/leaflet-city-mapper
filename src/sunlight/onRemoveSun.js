import { sunlightByControl } from '../globals/sunlightByControl.js';

import { removeSun } from './removeSun.js';

export function onRemoveSun() {
  const sunlight = sunlightByControl.get(this);
  if (!sunlight) return;
  removeSun(sunlight);
  sunlightByControl.delete(this);
}
