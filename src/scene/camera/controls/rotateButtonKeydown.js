export function rotateButtonKeydown(event) {
  const control = this._rotateControl, map = control._map, step = event.shiftKey ? 15 : 5;
  if (event.key === 'ArrowLeft') map.setBearing(map.getBearing() - step);
  else if (event.key === 'ArrowRight') map.setBearing(map.getBearing() + step);
  else if (event.key === 'ArrowUp' && control.options.visualizePitch) map.setPitch(map.getPitch() + step);
  else if (event.key === 'ArrowDown' && control.options.visualizePitch) map.setPitch(map.getPitch() - step);
  else if (event.key === 'Home' || event.key === ' ') this.click();
  else return;
  event.preventDefault();
  event.stopPropagation();
}
