import { imageStates } from '../weakmaps/imageStates.js';


export function nativeImageError(event) {
  const states = imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) {
    state.source.fire('error', /* alloc */ {
      error: /* alloc */ new Error('Unable to load native layer image'),
    });
  }
}
