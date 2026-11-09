export function parseHexColor(value) {
  let i = 0, offset = 0;
  if (value.length === 4) {
    value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
  }
  const color = /* alloc */ [];
  for (i = 1; i < 6; i += 2) {
    offset = parseInt(value.slice(i, i + 2), 16);
    color.push(offset);
  }
  color.push(1);
  return color;
}
