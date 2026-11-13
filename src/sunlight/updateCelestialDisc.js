import { projectCelestialBody } from '../projections/projectCelestialBody.js';

/**
 * Project and position a celestial disc, hiding it when it is below the horizon or outside the sky.
 *
 * @param {HTMLElement} disc Sun or moon element.
 * @param {Object|null|undefined} body Celestial altitude and direction.
 * @param {HTMLElement|null|undefined} sky Sky container.
 * @param {L.Point} size Viewport dimensions.
 * @param {number} pitch Camera pitch in radians.
 * @param {number} bearing Camera bearing in radians.
 * @param {Object} projection Reusable projection result.
 */
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
