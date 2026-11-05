export function onRemove() {
  this._walk.stop();
  this._walk.layer.remove();
}
