import { imageStates } from '../globals/imageStates.js';


export function nativeImageError(event) {
  const states = imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) {
    state.source.fire('error', /* allocation: required -- Each layer receives independent error event data. */ {
      error: /* allocation: required -- Capture the image-load failure stack for this layer. */ new Error('Unable to load native layer image'),
    });
  }
}
