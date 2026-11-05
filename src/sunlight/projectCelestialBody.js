/** Perspective projection of a celestial direction; null when behind the camera. */

export function projectCelestialBody(dir, size, pitch, bearing, target) {
  const [x, y, z] = dir;
  const forward = -x * Math.sin(bearing) * Math.sin(pitch) - y * Math.cos(pitch) - z * Math.cos(bearing) * Math.sin(pitch);
  if (forward > 0) {
    target ||= /* allocation: required -- Callers without an output buffer own an independent projection. */ {};
    target.left = size.x / 2 + size.y * 1.5 * (x * Math.cos(bearing) - z * Math.sin(bearing)) / forward;
    target.top = size.y / 2 - size.y * 1.5 * (-x * Math.sin(bearing) * Math.cos(pitch) + y * Math.sin(pitch) - z * Math.cos(bearing) * Math.cos(pitch)) / forward;
    return target;
  }
  return null;
}
