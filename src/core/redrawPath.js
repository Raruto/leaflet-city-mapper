import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';

export function redrawPath() {
  refreshNativeLayerContract(this);
  return this;
}
