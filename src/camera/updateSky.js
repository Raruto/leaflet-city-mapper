import { pitchSkyByMap } from '../weakmaps/pitchSkyByMap.js';

import { L } from '../globals/L.js';
import { radians } from '../globals/radians.js';

import { mapGetPitch } from './mapGetPitch.js';


export function updateSky() {
  const height = this.getSize().y, pitch = mapGetPitch(this) * radians;
  const far = height * this.options.pitchMaxDistance, distance = height * 1.5;
  const top = height / 2 - far * Math.abs(Math.cos(pitch)) * distance / (distance + Math.sin(pitch) * far);
  if (top > 0 && !pitchSkyByMap.get(this)) {
    pitchSkyByMap.set(this, L.DomUtil.create('div', 'leaflet-pitch-sky', this.getContainer()));
    pitchSkyByMap.get(this).setAttribute('aria-hidden', 'true');
    pitchSkyByMap.get(this).style.cssText = 'position:absolute;inset:0 0 auto;height:0;z-index:0;pointer-events:none;background:var(--leaflet-sky-background,linear-gradient(#9ec5e8,#dfe9f0))';
  }
  if (pitchSkyByMap.get(this)) {
    pitchSkyByMap.get(this).style.inset = pitch > Math.PI / 2 ? 'auto 0 0' : '0 0 auto';
    pitchSkyByMap.get(this).style.height = `${Math.max(0, Math.ceil(top))}px`;
    pitchSkyByMap.get(this).style.display = top > 0 ? '' : 'none';
  }
}
