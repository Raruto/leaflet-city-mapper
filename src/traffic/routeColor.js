export function routeColor(properties) {
  const color = properties?.route_color;
  if (!/^[\da-f]{6}$/i.test(color)) return /* allocation: required -- Vehicle model builders may retain and mutate their own fallback colors. */ [0.1, 0.55, 0.65];
  const value = Number.parseInt(color, 16);
  return /* allocation: required -- Vehicle model builders may retain and mutate their own route colors. */ [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}
