
export const build = parts => {
  const position = [], normal = [], color = [];
  const triangle = (a, b, c, tint) => {
    const u = b.map((v, i) => v - a[i]), v = c.map((w, i) => w - a[i]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], length = Math.hypot(...n);
    for (const point of [a, b, c]) { position.push(...point); normal.push(...n.map(w => w / length)); color.push(...tint); }
  };
  for (const [ring, bottom, top, tint, topRing = ring] of parts) {
    const low = ring.map(([x, z]) => [x, bottom, z]), high = topRing.map(([x, z]) => [x, top, z]);
    for (let i = 0; i < ring.length; i++) {
      const j = (i + 1) % ring.length;
      triangle(low[i], low[j], high[j], tint); triangle(low[i], high[j], high[i], tint);
    }
    for (let i = 1; i < ring.length - 1; i++) {
      triangle(high[0], high[i], high[i + 1], tint); triangle(low[0], low[i + 1], low[i], tint);
    }
  }
  return { position, normal, color };
};
