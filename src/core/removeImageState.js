import { imageStates } from '../globals/imageStates.js';


export function removeImageState(image, state) {
  const states = imageStates.get(image);
  if (!states) return;
  states.delete(state);
  if (!states.size) imageStates.delete(image);
}
