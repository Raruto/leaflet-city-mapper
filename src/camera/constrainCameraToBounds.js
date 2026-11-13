/** Pan this map inside its maximum bounds when bounds are configured. */
export function constrainCameraToBounds() {
  if (this.options.maxBounds) this._panInsideMaxBounds();
}
