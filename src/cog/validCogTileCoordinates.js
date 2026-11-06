export function validCogTileCoordinates(z, x, y) {
  return Number.isSafeInteger(z) && Number.isSafeInteger(x) && Number.isSafeInteger(y) &&
    z >= 0 && z <= 24 && x >= 0 && y >= 0 && x < 2 ** z && y < 2 ** z;
}
