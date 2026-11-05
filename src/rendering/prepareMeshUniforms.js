export function prepareMeshUniforms(renderer, mesh) {
  const uniforms = mesh.program.uniforms;
  const offset = renderer.uniformSlot++ * 256;
  const data = renderer.uniformData, base = offset / 4;
  data.set(mesh.worldMatrix, base);
  data.set(uniforms.baseColor.value, base + 16);
  data[base + 19] = 1;
  data[base + 20] = uniforms.metallic.value;
  data[base + 21] = uniforms.roughness.value;
  data[base + 22] = uniforms.opacity.value * (mesh.ground ? mesh._appearance ?? 1 : 1);
  data[base + 23] = uniforms.alphaCutoff.value;
  data.set(uniforms.emissive.value, base + 24);
  data[base + 27] = uniforms.occlusionStrength.value;
  data[base + 28] = mesh.terrain?.[0] ?? 0;
  data[base + 29] = mesh.terrain?.[1] ?? 0;
  data[base + 30] = mesh.terrain?.[2] ?? 0;
  data[base + 31] = mesh.terrain?.[3] ?? 0;
  data[base + 32] = mesh.highlight?.[0] ?? 0;
  data[base + 33] = mesh.highlight?.[1] ?? 0;
  data[base + 34] = mesh.program.nightSparkle ? data[55] : 0;
  data[base + 35] = mesh.ground ? 1 : mesh._appearance ?? 1;
  const cutout = (mesh._nativeSource || mesh._rasterSource)?.options.cutout;
  if (cutout && (!Number.isFinite(cutout.x) || !Number.isFinite(cutout.y) ||
      !Number.isFinite(cutout.radius) || cutout.radius < 0)) {
    throw /* alloc */ new Error('cutout requires finite x, y and a non-negative radius in CSS pixels');
  }
  data[base + 36] = (cutout?.x ?? 0) * renderer.dpr;
  data[base + 37] = (cutout?.y ?? 0) * renderer.dpr;
  data[base + 38] = (cutout?.radius ?? 0) * renderer.dpr;
  data[base + 39] = cutout?.outside ? 1 : 0;
  return offset;
}
