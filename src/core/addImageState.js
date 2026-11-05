import { imageStates } from '../globals/imageStates.js';


export function addImageState(image, state) {
  let states = imageStates.get(image);
  if (!states) imageStates.set(image, states = /* alloc */ new Set());
  states.add(state);
}
