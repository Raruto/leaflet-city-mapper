import { dragStates } from '../weakmaps/dragStates.js';

import { finishCameraDrag } from './finishCameraDrag.js';

export function cameraDragEnd(event) {
  finishCameraDrag(dragStates.value.get(this), event);
}
