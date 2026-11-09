export function refreshVectorTiles() {
  clearTimeout(this.timer);
  this.changedAt = performance.now();
  this.timer = setTimeout(this.update.bind(this), 180);
}
