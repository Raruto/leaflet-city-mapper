export function cross(a, b) {
  return /* allocation: required -- Vector results remain independent for callers retaining multiple products. */ [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
