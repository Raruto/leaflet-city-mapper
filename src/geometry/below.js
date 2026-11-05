export function below(p) {
  return /* allocation: required -- The caller owns the lowered coordinate independently of its source. */ [p[0], p[1] - 1.2, p[2]];
}
