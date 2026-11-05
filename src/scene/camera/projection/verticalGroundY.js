export function verticalGroundY(y, tilt, distance, rise, far) {
  return tilt * distance + rise * y > 0
    ? Math.max(-far, Math.min(far, y * distance / (tilt * distance + rise * y))) : -far;
}
