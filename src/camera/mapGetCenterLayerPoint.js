import { mapMethods } from '../globals/mapMethods.js';


export function mapGetCenterLayerPoint() {
  return mapMethods.value.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
}
