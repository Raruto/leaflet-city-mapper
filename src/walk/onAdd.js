
export function onAdd(map) {
  this._walk.layer.addTo(map);
  return this._walk.container;
}
