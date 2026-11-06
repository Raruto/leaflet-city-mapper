import { inside } from './inside.js';
import { insideHole } from './insideHole.js';
import { crossesBoundary } from './crossesBoundary.js';

export function connectHole(polygon, hole, rings, mid) {
  let h2 = -1, p2 = -1, distance = Infinity, h, p, a, b, d;
  for (h = 0; h < hole.length; h++) for (p = 0; p < polygon.length; p++) {
    a = hole[h], b = polygon[p], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    if (d >= distance) continue;
    mid.x = (a.x + b.x) / 2; mid.y = (a.y + b.y) / 2;
    if (!inside(mid, rings[0]) || insideHole(mid, rings)) continue;
    if (crossesBoundary(a, b, polygon, rings)) continue;
    h2 = h; p2 = p; distance = d;
  }
  if (h2 < 0) throw /* alloc */ new Error('Unable to connect polygon hole');
  return /* alloc */ [...polygon.slice(0, p2 + 1), ...hole.slice(h2), ...hole.slice(0, h2 + 1),
    polygon[p2], ...polygon.slice(p2 + 1)];
}
