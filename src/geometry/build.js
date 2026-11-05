import { triangle } from './triangle.js';

export function build(parts) {
  const position = /* alloc */ [];
  const normal = /* alloc */ [];
  const color = /* alloc */ [];
  const low = /* alloc */ [];
  const high = /* alloc */ [];
  let ring, bottom, top, tint, topRing, x, z, i, j;
  for ([ring, bottom, top, tint, topRing = ring] of parts) {
    low.length = high.length = 0;
    for ([x, z] of ring) low.push(/* alloc */ [x, bottom, z]);
    for ([x, z] of topRing) high.push(/* alloc */ [x, top, z]);
    for (i = 0; i < ring.length; i++) {
      j = (i + 1) % ring.length;
      triangle(position, normal, color, low[i], low[j], high[j], tint); triangle(position, normal, color, low[i], high[j], high[i], tint);
    }
    for (i = 1; i < ring.length - 1; i++) {
      triangle(position, normal, color, high[0], high[i], high[i + 1], tint); triangle(position, normal, color, low[0], low[i + 1], low[i], tint);
    }
  }
  return /* alloc */ { position, normal, color };
}
