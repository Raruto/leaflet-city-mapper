import { markerMethods } from '../globals/markerMethods.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



export function markerUpdateZIndex(offset) {
  markerMethods.value._updateZIndex.call(this, offset);
  const changed = sceneByLayer.get(this)._cameraZIndexOffset !== offset;
  sceneByLayer.get(this)._cameraZIndexOffset = offset;
  if (changed) refreshNativeLayerContract(this);
}
import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';
