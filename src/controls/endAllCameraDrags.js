import { cameraDrags } from '../globals/cameraDrags.js';
import { finishCameraDrag } from './finishCameraDrag.js';

export function endAllCameraDrags() {
  let state;
  for (state of cameraDrags.value) finishCameraDrag(state);
}
