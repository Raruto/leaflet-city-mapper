/** Perspective projection of a celestial direction; null when behind the camera. */

export function projectCelestialBody(direction, size, pitch, bearing) {
  const [x, y, z] = direction;
  const right = x * Math.cos(bearing) - z * Math.sin(bearing);
  const up = -x * Math.sin(bearing) * Math.cos(pitch) + y * Math.sin(pitch) - z * Math.cos(bearing) * Math.cos(pitch);
  const forward = -x * Math.sin(bearing) * Math.sin(pitch) - y * Math.cos(pitch) - z * Math.cos(bearing) * Math.sin(pitch);
  if (forward <= 0) return null;
  const left = size.x / 2 + size.y * 1.5 * right / forward;
  const top = size.y / 2 - size.y * 1.5 * up / forward;
  return { left, top };
}
