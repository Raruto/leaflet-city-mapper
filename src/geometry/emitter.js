export function emitter(point, u, v, axis) {
  const r = 0.65;
  return /* allocation: required -- Triangle callbacks may retain each independent emitter vertex. */ {
    x: point.x + (axis === 2 ? 0 : u * r),
    y: point.y + (axis === 1 ? 0 : axis === 2 ? u * r : v * r),
    ground: point.ground + (axis === 0 ? 0 : v * r), uv: /* allocation: required -- Each retained emitter vertex owns its UV coordinate. */ [u, v],
  };
}
