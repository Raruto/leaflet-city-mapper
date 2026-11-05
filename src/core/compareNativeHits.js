export function compareNativeHits(a, b) {
  return b.object.renderOrder - a.object.renderOrder || a.distance - b.distance;
}
