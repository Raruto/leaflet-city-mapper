export function ring(point, radius) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    points.push({
      x: point.x + Math.cos(i * Math.PI / 3) * radius,
      y: point.y + Math.sin(i * Math.PI / 3) * radius, ground: point.ground, uv: [3, 3],
    });
  }
  return points;
}
