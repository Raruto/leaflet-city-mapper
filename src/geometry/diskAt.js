export function diskAt(center, radius, radiusY, count, index) {
  return /* allocation: required -- The caller owns this disk sample independently of later samples. */ new L.Point(center.x + radius * Math.cos(index * 2 * Math.PI / count),
    center.y + radiusY * Math.sin(index * 2 * Math.PI / count));
}
