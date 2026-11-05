export function visitCells(packed, minX, minZ, cellSize, columns, offsets, data) {
  for (const values of packed) for (let i = 0; i < values.length; i += 8) {
    const radius = values[i + 3], x = values[i] - minX, z = values[i + 2] - minZ;
    for (let y = Math.floor((z - radius) / cellSize); y <= Math.floor((z + radius) / cellSize); y++) {
      for (let c = Math.floor((x - radius) / cellSize); c <= Math.floor((x + radius) / cellSize); c++) {
        const key = y * columns + c;
        if (data) {
          for (let j = 0, o = offsets[key] * 4; j < 8; j++) data[o + j] = values[i + j];
          offsets[key] += 2;
        } else offsets[key]++;
      }
    }
  }
}
