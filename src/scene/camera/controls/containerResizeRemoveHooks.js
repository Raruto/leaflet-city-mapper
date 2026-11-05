export function containerResizeRemoveHooks() {
  const container = this._map.getContainer();
  this._observer.disconnect();
  delete container._containerResizeMap;
}
