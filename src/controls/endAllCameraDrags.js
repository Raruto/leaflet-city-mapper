import { cameraDrags } from '../globals/cameraDrags.js';
import { finishCameraDrag } from './finishCameraDrag.js';

/** Finish every active camera drag, such as when the window loses focus. */
export function endAllCameraDrags() {
  let state;
  for (state of cameraDrags.value) finishCameraDrag(state);
}
