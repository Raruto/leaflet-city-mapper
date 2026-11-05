export function compassRemoveHooks() {
  this._generation++;
  window.removeEventListener('deviceorientation', this._orientation);
  window.removeEventListener('deviceorientationabsolute', this._orientation);
}
