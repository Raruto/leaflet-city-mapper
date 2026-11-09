export function nativeStrokeExpansion(mesh) {
  const strokeScale = mesh.program?.uniforms?.strokeScale?.value ?? 1;
  return Math.max(0, strokeScale - 1) * (mesh.geometry.nativeStrokeRadius || 0);
}
