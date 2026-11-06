import { projectCelestialBody } from './projectCelestialBody.js';

export function updateCelestialDisc(disc, body, sky, size, pitch, bearing, projection) {
  disc.hidden = true;
  if (!sky || !body || body.altitude <= 0) return;
  if (disc.parentNode !== sky) sky.append(disc);
  const point = projectCelestialBody(body.direction, size, pitch, bearing, projection);
  if (!point) return;
  const { left, top } = point;
  disc.hidden = left < 0 || left > size.x || top < 0 || top > sky.clientHeight || sky.style.display === 'none';
  disc.style.left = `${left}px`; disc.style.top = `${top}px`;
}
