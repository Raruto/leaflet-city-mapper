import { parseColor } from "./parseColor.js";

/** Schematic support and lamp head; wall-mounted fixtures do not get an invented pole. */

export function lampPostGeometry(point, style, addTriangle) {
  const color = parseColor(0x50565a), radius = style.poleRadius;
  if (!Number.isFinite(radius) || radius <= 0) throw new Error('Invalid lamp pole radius');
  const ring = r => Array.from({ length: 6 }, (_, i) => ({
    x: point.x + Math.cos(i * Math.PI / 3) * r,
    y: point.y + Math.sin(i * Math.PI / 3) * r, ground: point.ground, uv: [3, 3],
  }));
  const center = { ...point, uv: [3, 3] };
  for (const [r, low, high] of [[radius, 0, style.top], [radius * 2.5, style.top - 0.25, style.top + 0.15]]) {
    const points = ring(r);
    for (let i = 0; i < 6; i++) {
      const a = points[i], b = points[(i + 1) % 6], angle = (i + 0.5) * Math.PI / 3;
      const nx = Math.cos(angle), nz = -Math.sin(angle);
      addTriangle(a, low, b, low, b, high, nx, 0, nz, color);
      addTriangle(a, low, b, high, a, high, nx, 0, nz, color);
      addTriangle(center, high, a, high, b, high, 0, 1, 0, color);
      addTriangle(center, low, b, low, a, low, 0, -1, 0, color);
    }
  }
}
