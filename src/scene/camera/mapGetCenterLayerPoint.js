import { mapCameraState } from './constants/mapCameraState.js';

export function mapGetCenterLayerPoint() {
  return mapCameraState.mapMethods.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
}
