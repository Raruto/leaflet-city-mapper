export function validateCameraInverse(matrix) {
  let column, row;
  for (column = 1; column <= 4; column++) {
    for (row = 1; row <= 4; row++) {
      if (!Number.isFinite(matrix[`m${column}${row}`])) throw /* alloc */ new Error('Singular 3D transform');
    }
  }
}
