import { state as sharedState } from '../state.js';

import { finishCameraDrag } from './finishCameraDrag.js';

export function endAllCameraDrags() {
  let state;
  for (state of sharedState.cameraDrags) finishCameraDrag(state);
}
