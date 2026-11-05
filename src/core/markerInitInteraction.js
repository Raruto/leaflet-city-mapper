import { state as sharedState } from '../state.js';

import { cameraMarkerDrag } from './cameraMarkerDrag.js';

export function markerInitInteraction() {
  const result = sharedState.markerMethods._initInteraction.call(this);
  cameraMarkerDrag.call(this);
  return result;
}
