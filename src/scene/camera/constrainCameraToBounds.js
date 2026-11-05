export function constrainCameraToBounds() {
  if (this.options.maxBounds) this._panInsideMaxBounds();
}
