/** Perspective projection of a celestial direction; null when behind the camera. */

export function projectCelestialBody(dir, size, pitch, bearing) {
  const forward = -dir.x * Math.sin(bearing) * Math.sin(pitch) - dir.y * Math.cos(pitch) - dir.z * Math.cos(bearing) * Math.sin(pitch);
  if (forward > 0) {
    return {
      left: size.x / 2 + size.y * 1.5 * (dir.x * Math.cos(bearing) - dir.z * Math.sin(bearing)) / forward,
      top:  size.y / 2 - size.y * 1.5 * (-dir.x * Math.sin(bearing) * Math.cos(pitch) + dir.y * Math.sin(pitch) - dir.z * Math.cos(bearing) * Math.cos(pitch)) / forward
    };
  }
  return null;
}
