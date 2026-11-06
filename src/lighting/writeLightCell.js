export function writeLightCell(values, i, key, offsets, data) {
  let j, o;
  for (j = 0, o = offsets[key] * 4; j < 8; j++) data[o + j] = values[i + j];
  offsets[key] += 2;
}
