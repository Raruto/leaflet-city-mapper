import { cameraZIndexOffsetByLayer } from '../weakmaps/cameraZIndexOffsetByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { markerMethods } from '../globals/markerMethods.js';



export function markerUpdateZIndex(offset) {
  markerMethods.value._updateZIndex.call(this, offset);
  const changed = cameraZIndexOffsetByLayer.get(this) !== offset;
  mutateWeakMap(cameraZIndexOffsetByLayer, this, "=", offset);
  if (changed) refreshNativeLayerContract(this);
}
import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';
