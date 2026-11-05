import { state as sharedState } from '../state.js';
import { mapGetPitch } from './mapGetPitch.js';
import { pluginState } from '../core/pluginState.js';

export function updateSky() {
  const height = this.getSize().y, pitch = mapGetPitch(this) * sharedState.radians;
  const far = height * this.options.pitchMaxDistance, distance = height * 1.5;
  const top = height / 2 - far * Math.cos(pitch) * distance / (distance + Math.sin(pitch) * far);
  if (top > 0 && !pluginState(this)._pitchSky) {
    pluginState(this)._pitchSky = L.DomUtil.create('div', 'leaflet-pitch-sky', this.getContainer());
    pluginState(this)._pitchSky.setAttribute('aria-hidden', 'true');
    pluginState(this)._pitchSky.style.cssText = 'position:absolute;inset:0 0 auto;height:0;z-index:0;pointer-events:none;background:var(--leaflet-sky-background,linear-gradient(#9ec5e8,#dfe9f0))';
  }
  if (pluginState(this)._pitchSky) {
    pluginState(this)._pitchSky.style.height = `${Math.max(0, Math.ceil(top))}px`;
    pluginState(this)._pitchSky.style.display = top > 0 ? '' : 'none';
  }
}
