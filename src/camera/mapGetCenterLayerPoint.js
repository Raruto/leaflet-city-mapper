import { state as sharedState } from '../state.js';

export function mapGetCenterLayerPoint() {
  return sharedState.mapMethods.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
}
