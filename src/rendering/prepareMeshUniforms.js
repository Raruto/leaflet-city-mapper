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
  prepareMeshCutout(renderer, mesh, base);
  return offset;
}
import { prepareMeshCutout } from '../materials/prepareMeshCutout.js';
