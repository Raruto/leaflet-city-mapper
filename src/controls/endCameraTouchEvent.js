import { touchByContainer } from '../weakmaps/touchByContainer.js';


import { endCameraTouch } from './endCameraTouch.js';

export function endCameraTouchEvent(event) {
  endCameraTouch(touchByContainer.get(this), event);
}
