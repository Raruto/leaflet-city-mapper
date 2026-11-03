export function disposeMesh(backend, mesh) {
  if (!mesh) {
    return;
  }
  backend.remove(mesh);
  for (const attribute of Object.values(mesh.geometry.attributes)) {
    attribute.buffer.destroy();
  }
  mesh.program.pipelineCache.clear();
}
