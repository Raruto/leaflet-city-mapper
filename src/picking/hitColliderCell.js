import { horizontalRay } from '../collision/horizontalRay.js';

export function hitColliderCell(cell, c, data, ox, oy, oz) {
  const { dx, dz, seen } = data;
  let t, height, d;
  for (t of cell) {
    if (seen.has(t) || dx * c.nrm[t * 2] + dz * c.nrm[t * 2 + 1] >= 0) continue;
    seen.add(t);
    for (height = 0.4; height < 2; height += 1.1) {
      d = horizontalRay(c.tri, t, ox, oy + height, oz, dx, dz);
      if (d >= 0 && d < data.best) {
        data.best = d;
        data.found = true;
        data.normal[0] = c.nrm[t * 2];
        data.normal[1] = c.nrm[t * 2 + 1];
      }
    }
  }
}
