export function triangle(point, target, a, b, c) {
  return target.push(...point(a), ...point(b), ...point(c));
}
