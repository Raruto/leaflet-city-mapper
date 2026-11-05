import { updateSky } from './updateSky.js';

export function mapSetPitchAndBearing(pitch, bearing) {
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw new TypeError('Camera angles must be finite numbers');
  const previousPitch = this.getPitch(), previousBearing = this.getBearing();
  this._cameraPitch = Math.max(0, Math.min(85, pitch));
  this._cameraBearing = ((bearing % 360) + 360) % 360;
  if (this._loaded) {
    updateSky.call(this);
    if (previousBearing !== this.getBearing()) this.fire('rotate', { bearing: this.getBearing() });
    if (previousPitch !== this.getPitch()) this.fire('pitch', { pitch: this.getPitch() });
  }
  return this;
}
