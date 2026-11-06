import { CELL } from '../globals/CELL.js';

import { computeBounds } from '../geometry/computeBounds.js';
import { collider } from '../collision/collider.js';

import { hitColliderCell } from './hitColliderCell.js';

export function hitMesh(mesh, data) {
  if (!mesh.visible) return true;
  if (!mesh.geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return;
  if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
  const m = mesh.worldMatrix, { center: k, radius } = mesh.geometry.bounds;
  const { x, y, z, dx, dz, reach } = data;
  if (Math.hypot(m[0] * k[0] + m[4] * k[1] + m[8] * k[2] + m[12] - x, m[2] * k[0] + m[6] * k[1] + m[10] * k[2] + m[14] - z) >
    radius * Math.hypot(m[0], m[1], m[2]) + reach) return;
  const c = collider(mesh), ox = x - m[12] + c.origin[0], oy = y - m[13] + c.origin[1], oz = z - m[14] + c.origin[2];
  const seen = data.seen;
  seen.clear();
  let ix, iz, cell;
  for (ix = Math.floor(Math.min(ox, ox + dx * reach) / CELL); ix <= Math.floor(Math.max(ox, ox + dx * reach) / CELL); ix++)
    for (iz = Math.floor(Math.min(oz, oz + dz * reach) / CELL); iz <= Math.floor(Math.max(oz, oz + dz * reach) / CELL); iz++) {
      cell = c.cells.get(ix + ',' + iz);
      if (!cell) continue;
      hitColliderCell(cell, c, data, ox, oy, oz);
    }
}
