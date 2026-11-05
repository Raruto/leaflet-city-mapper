export function quad(addTriangle, color, a, b, c, d, height, normal) {
  addTriangle(a, height, b, height, c, height, ...normal, color);
  addTriangle(a, height, c, height, d, height, ...normal, color);
}
