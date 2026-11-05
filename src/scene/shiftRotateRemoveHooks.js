export function shiftRotateRemoveHooks() {
  const container = this._map.getContainer();
  container.removeEventListener('wheel', this._wheel, true);
  delete container._cameraShiftRotate;
}
