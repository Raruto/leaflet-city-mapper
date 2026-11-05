export function refreshNativeLayerContract(layer = this) {
  layer?._nativeGPU?.refresh?.();
}
