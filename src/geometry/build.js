import { triangle } from './triangle.js';

export function build(parts) {
  const position = [], normal = [], color = [];
  for (const [ring, bottom, top, tint, topRing = ring] of parts) {
    const low = [], high = [];
    for (const [x, z] of ring) low.push([x, bottom, z]);
    for (const [x, z] of topRing) high.push([x, top, z]);
    for (let i = 0; i < ring.length; i++) {
      const j = (i + 1) % ring.length;
      triangle(position, normal, color, low[i], low[j], high[j], tint); triangle(position, normal, color, low[i], high[j], high[i], tint);
    }
    for (let i = 1; i < ring.length - 1; i++) {
      triangle(position, normal, color, high[0], high[i], high[i + 1], tint); triangle(position, normal, color, low[0], low[i + 1], low[i], tint);
    }
  }
  return { position, normal, color };
}
