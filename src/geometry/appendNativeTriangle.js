export function triangle(point, target, a, b, c, anchorA, anchorB, anchorC) {
  return target.push(...point(a, anchorA), ...point(b, anchorB), ...point(c, anchorC));
}
