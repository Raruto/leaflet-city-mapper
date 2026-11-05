import { computeBounds } from '../geometry/computeBounds.js';
import { collider } from '../collision/collider.js';
import { CELL } from '../constants/CELL.js';
import { horizontalRay } from '../collision/horizontalRay.js';

export function hitMesh(mesh, data) {
  if (!mesh.visible) return true;
  if (!mesh.geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return;
  if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
  const m = mesh.worldMatrix, { center: k, radius } = mesh.geometry.bounds;
  const { x, y, z, dx, dz, reach } = data;
  if (Math.hypot(m[0] * k[0] + m[4] * k[1] + m[8] * k[2] + m[12] - x, m[2] * k[0] + m[6] * k[1] + m[10] * k[2] + m[14] - z) >
    radius * Math.hypot(m[0], m[1], m[2]) + reach) return;
  const c = collider(mesh), ox = x - m[12] + c.origin[0], oy = y - m[13] + c.origin[1], oz = z - m[14] + c.origin[2];
  const seen = new Set();
  for (let ix = Math.floor(Math.min(ox, ox + dx * reach) / CELL); ix <= Math.floor(Math.max(ox, ox + dx * reach) / CELL); ix++)
    for (let iz = Math.floor(Math.min(oz, oz + dz * reach) / CELL); iz <= Math.floor(Math.max(oz, oz + dz * reach) / CELL); iz++)
      for (const t of c.cells.get(ix + ',' + iz) || []) {
        if (seen.has(t) || dx * c.nrm[t * 2] + dz * c.nrm[t * 2 + 1] >= 0) continue;
        seen.add(t);
        for (const height of [0.4, 1.5]) {
          const d = horizontalRay(c.tri, t, ox, oy + height, oz, dx, dz);
          if (d >= 0 && d < data.best) {
            data.best = d;
            data.found = [c.nrm[t * 2], c.nrm[t * 2 + 1]];
          }
        }
      }
}
