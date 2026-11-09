export function projectVectorPoint(point, coords, extent) {
  const size = 2 ** coords.z;
  const x = (coords.x + point[0] / extent) / size;
  const y = (coords.y + point[1] / extent) / size;
  return /* alloc */ [Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI, x * 360 - 180];
}
