export function hiddenLightHit(mesh, i, u, v, night) {
  if (!mesh.program.nightLight) return false;
  const { index, uv: { data: uv } } = mesh.geometry.attributes;
  const idA = index ? index.data[i] : i, idB = index ? index.data[i + 1] : i + 1, idC = index ? index.data[i + 2] : i + 2;
  const x = uv[idA * 2] * (1 - u - v) + uv[idB * 2] * u + uv[idC * 2] * v;
  const y = uv[idA * 2 + 1] * (1 - u - v) + uv[idB * 2 + 1] * u + uv[idC * 2 + 1] * v;
  return x <= 2 && (!night || x * x + y * y > 0.9);
}
