export function visitCells(packed, minX, minZ, cellSize, columns, offsets, data) {
  let values, i, radius, x, z, y, c, key, j, o;
  for (values of packed) for (i = 0; i < values.length; i += 8) {
    radius = values[i + 3], x = values[i] - minX, z = values[i + 2] - minZ;
    for (y = Math.floor((z - radius) / cellSize); y <= Math.floor((z + radius) / cellSize); y++) {
      for (c = Math.floor((x - radius) / cellSize); c <= Math.floor((x + radius) / cellSize); c++) {
        key = y * columns + c;
        if (data) {
          for (j = 0, o = offsets[key] * 4; j < 8; j++) data[o + j] = values[i + j];
          offsets[key] += 2;
        } else offsets[key]++;
      }
    }
  }
}
