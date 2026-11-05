export function refreshRotateControl() {
  const map = this._map, pitch = this.options.visualizePitch ? map.getPitch() : 0;
  this._arrow.style.transform = `scale(${1 / Math.sqrt(Math.cos(pitch * Math.PI / 180))}) rotateX(${pitch}deg) rotate(${map.getBearing()}deg)`;
  this._button.setAttribute('aria-description', `Bearing ${Math.round(map.getBearing())} degrees, pitch ${Math.round(map.getPitch())} degrees. Arrow keys adjust the camera; Home resets it.`);
  this._container.style.display = this.options.closeOnZeroBearing && !map.getBearing() && !pitch &&
    !this._container.contains(document.activeElement) ? 'none' : '';
}
