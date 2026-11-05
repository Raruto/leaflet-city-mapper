import { markerMethods } from '../globals/markerMethods.js';


import { cameraMarkerDrag } from './cameraMarkerDrag.js';

export function markerInitInteraction() {
  const result = markerMethods.value._initInteraction.call(this);
  cameraMarkerDrag.call(this);
  return result;
}
