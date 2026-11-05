import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';

export function redrawPath() {
  refreshNativeLayerContract(this);
  return this;
}
