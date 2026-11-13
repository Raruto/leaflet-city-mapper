import { touchByContainer } from '../weakmaps/touchByContainer.js';
import { endCameraTouch } from './endCameraTouch.js';

/**
 * End the camera touch gesture associated with this container.
 *
 * @param {TouchEvent} event Touch completion event.
 */
export function endCameraTouchEvent(event) {
  endCameraTouch(touchByContainer.get(this), event);
}
