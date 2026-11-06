import { cameraZIndexOffsetByLayer } from '../weakmaps/cameraZIndexOffsetByLayer.js';

import { markerMethods } from '../globals/markerMethods.js';



export function markerUpdateZIndex(offset) {
  markerMethods.value._updateZIndex.call(this, offset);
  const changed = cameraZIndexOffsetByLayer.get(this) !== offset;
  cameraZIndexOffsetByLayer.set(this, offset);
  if (changed) refreshNativeLayerContract(this);
}
import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';
