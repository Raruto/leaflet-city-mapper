export function bringNativeLayerToFront(layer = this) {
  layer?._nativeGPU?.reorder?.(true);
}
