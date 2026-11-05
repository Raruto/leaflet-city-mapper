import { imageStates } from '../globals/imageStates.js';


export function addImageState(image, state) {
  let states = imageStates.get(image);
  if (!states) imageStates.set(image, states = /* allocation: required -- Each image tracks the layer owners to unregister when it is released. */ new Set());
  states.add(state);
}
