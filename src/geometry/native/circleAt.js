export function circleAt(center, radius, radiusY, count, index, offset = 0) {
  const angle = index * Math.PI * 2 / count;
  return new L.Point(center.x + Math.max(0, radius + offset) * Math.cos(angle),
    center.y + Math.max(0, radiusY + offset) * Math.sin(angle));
}
