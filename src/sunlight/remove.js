export function remove() {
  if (this._map?.hasLayer(this.layer)) {
    this._map.removeLayer(this.layer);
    return this;
  }
  return L.Control.prototype.remove.call(this);
}
