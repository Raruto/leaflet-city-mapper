import { sunlightByControl } from '../globals/sunlightByControl.js';

import { removeSun } from './removeSun.js';

export function onRemoveSun() {
  const sunlight = sunlightByControl.get(this);
  removeSun(sunlight);
  sunlightByControl.delete(this);
}
