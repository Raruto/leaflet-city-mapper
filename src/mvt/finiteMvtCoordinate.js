export function finiteMvtCoordinate(point) {
  let i = 0;
  for (; i < point.length; i++) {
    if (!Number.isFinite(point[i])) return false;
  }
  return true;
}
