export function quad(addTriangle, color, a, b, c, d, height, nx, ny, nz) {
  if (typeof nx !== 'number') {
    addTriangle(a, height, b, height, c, height, ...nx, color);
    addTriangle(a, height, c, height, d, height, ...nx, color);
  } else {
    addTriangle(a, height, b, height, c, height, nx, ny, nz, color);
    addTriangle(a, height, c, height, d, height, nx, ny, nz, color);
  }
}
