import { projectCelestialBody } from './projectCelestialBody.js';

export function updateSky({ map, originalSky, sunDisc, moonDisc }) {
  const sun = map._sunlight, sky = map._pitchSky;
  if (sun) map.getContainer().style.setProperty('--leaflet-sky-background', sun.background);
  else if (originalSky) map.getContainer().style.setProperty('--leaflet-sky-background', originalSky);
  else map.getContainer().style.removeProperty('--leaflet-sky-background');
  const size = map.getSize(), pitch = map.getPitch() * Math.PI / 180, bearing = map.getBearing() * Math.PI / 180;
  for (const [disc, body] of [[sunDisc, sun], [moonDisc, sun?.moon]]) {
    disc.hidden = true;
    if (!sky || !body || body.altitude <= 0 || !sun) continue;
    if (disc.parentNode !== sky) sky.append(disc);
    const point = projectCelestialBody(body.direction, size, pitch, bearing);
    if (!point) continue;
    const { left, top } = point;
    disc.hidden = left < 0 || left > size.x || top < 0 || top > sky.clientHeight || sky.style.display === 'none';
    disc.style.left = `${left}px`; disc.style.top = `${top}px`;
  }
}
