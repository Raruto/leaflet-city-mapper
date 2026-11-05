import { mapCameraState } from './constants/mapCameraState.js';

export function markerGetEvents() {
  return { ...mapCameraState.markerMethods.getEvents.call(this), rotate: this.update, pitch: this.update, move: this.update };
}
