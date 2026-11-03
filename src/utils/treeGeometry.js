import { parseColor } from "./parseColor.js";

/** Low-poly tree, sharing the source block's buffers, picking and terrain offset. */

export function treeGeometry(point, style, addTriangle) {
  const { top, bottom = 0, trunkRadius, crownRadius, crownBottom, crownShape = 'round' } = style;
  if (![trunkRadius, crownRadius, crownBottom].every(Number.isFinite) ||
    trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top ||
    !['round', 'cone'].includes(crownShape)) {
    throw new Error('Invalid tree dimensions or crown shape');
  }
  const trunk = parseColor(style.trunkColor ?? 0x72513a);
  const crown = parseColor(style.color ?? 0x4f823b);
  const ring = radius => Array.from({ length: 8 }, (_, i) => ({
    x: point.x + Math.cos(i * Math.PI / 4) * radius,
    y: point.y + Math.sin(i * Math.PI / 4) * radius,
    ground: point.ground,
  }));
  const surface = (lowRadius, low, highRadius, high, color) => {
    const lower = ring(lowRadius), upper = ring(highRadius);
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      const angle = (i + 0.5) * Math.PI / 4;
      const slope = (lowRadius - highRadius) / (high - low);
      const length = Math.hypot(1, slope);
      const nx = Math.cos(angle) / length, ny = slope / length, nz = -Math.sin(angle) / length;
      if (lowRadius) addTriangle(lower[i], low, lower[next], low, upper[next], high, nx, ny, nz, color);
      if (highRadius) addTriangle(lower[i], low, upper[next], high, upper[i], high, nx, ny, nz, color);
    }
  };
  surface(trunkRadius, bottom, trunkRadius, crownBottom + (top - crownBottom) * 0.25, trunk);
  if (crownShape === 'cone') {
    const base = ring(crownRadius);
    for (let i = 0; i < 8; i++) addTriangle(point, crownBottom, base[i], crownBottom,
      base[(i + 1) % 8], crownBottom, 0, -1, 0, crown);
    surface(crownRadius, crownBottom, 0, top, crown);
  } else {
    const profile = [[0, 0], [0.35, 0.8], [0.6, 1], [0.85, 0.7], [1, 0]];
    for (let i = 1; i < profile.length; i++) {
      const [low, lr] = profile[i - 1], [high, hr] = profile[i];
      surface(lr * crownRadius, crownBottom + low * (top - crownBottom),
        hr * crownRadius, crownBottom + high * (top - crownBottom), crown);
    }
  }
}
