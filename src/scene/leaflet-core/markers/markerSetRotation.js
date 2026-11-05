export function markerSetRotation(rotation) {
  if (!Number.isFinite(rotation)) throw new TypeError('Marker rotation must be finite');
  this.options.rotation = rotation;
  this.update();
  this._nativeGPU?.refresh?.();
  return this;
}
