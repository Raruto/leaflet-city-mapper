import { roundProfile } from './constants/roundProfile.js';
import { parseColor } from "../utils/parseColor.js";
import { ring } from './treeRing.js';
import { surface } from './surface.js';

/** Low-poly tree, sharing the source block's buffers, picking and terrain offset. */

export function treeGeometry(point, style, addTriangle) {
  const { top, bottom = 0, trunkRadius, crownRadius, crownBottom, crownShape = 'round' } = style;
  if (!Number.isFinite(trunkRadius) || !Number.isFinite(crownRadius) || !Number.isFinite(crownBottom) ||
    trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top ||
    !['round', 'cone'].includes(crownShape)) {
    throw new Error('Invalid tree dimensions or crown shape');
  }
  const trunk = parseColor(style.trunkColor ?? 0x72513a);
  const crown = parseColor(style.color ?? 0x4f823b);
  surface(point, addTriangle, trunkRadius, bottom, trunkRadius, crownBottom + (top - crownBottom) * 0.25, trunk);
  if (crownShape === 'cone') {
    const base = ring(point, crownRadius);
    for (let i = 0; i < 8; i++) addTriangle(point, crownBottom, base[i], crownBottom,
      base[(i + 1) % 8], crownBottom, 0, -1, 0, crown);
    surface(point, addTriangle, crownRadius, crownBottom, 0, top, crown);
  } else {
    for (let i = 1; i < roundProfile.length; i++) {
      const [low, lr] = roundProfile[i - 1], [high, hr] = roundProfile[i];
      surface(point, addTriangle, lr * crownRadius, crownBottom + low * (top - crownBottom),
        hr * crownRadius, crownBottom + high * (top - crownBottom), crown);
    }
  }
}
