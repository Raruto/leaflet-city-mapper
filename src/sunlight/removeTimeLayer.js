export function removeTimeLayer() {
  return L.Control.prototype.remove.call(this.control);
}
