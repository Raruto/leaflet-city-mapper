export function drawShadowMeshes(backend, encoder, meshes) {
  const renderer = backend.renderer, device = renderer.device, sun = renderer.sunlight;
  const pass = encoder.beginRenderPass({
    colorAttachments: [],
    depthStencilAttachment: {
      view: sun.texture.createView(), depthClearValue: 1,
      depthLoadOp: 'clear', depthStoreOp: 'store'
    },
  });
  let pipeline = sun.pipeline;
  pass.setPipeline(pipeline);
  pass.setBindGroup(1, sun.depthBindGroup);
  for (const mesh of meshes) {
    const instances = mesh.geometry.attributes.instanceOffset;
    const nextPipeline = instances ? sun.instancePipeline : sun.pipeline;
    if (nextPipeline !== pipeline) {
      pipeline = nextPipeline;
      pass.setPipeline(pipeline);
    }
    const offset = renderer.uniformSlot++ * 256;
    renderer.uniformData.set(mesh.worldMatrix, offset / 4);
    renderer.uniformData[offset / 4 + 35] = mesh._appearance ?? 1;
    if (mesh._shadowBuffer !== renderer.uniformBuffer) {
      mesh._shadowBuffer = renderer.uniformBuffer;
      mesh._shadowBindGroup = device.createBindGroup({
        layout: sun.meshLayout, entries: [
          { binding: 0, resource: { buffer: renderer.uniformBuffer, size: 144 } },
        ]
      });
    }
    for (const attribute of Object.values(mesh.geometry.attributes)) {
      if (attribute.needsUpdate) {
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
        attribute.needsUpdate = false;
      }
    }
    pass.setBindGroup(0, mesh._shadowBindGroup, [offset]);
    pass.setVertexBuffer(0, mesh.geometry.attributes.position.buffer);
    if (instances) pass.setVertexBuffer(1, instances.buffer);
    const index = mesh.geometry.attributes.index, range = mesh.geometry.drawRange;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(range.count, instances?.count ?? 1, range.start, 0, 0);
    } else pass.draw(range.count, instances?.count ?? 1, range.start, 0);
  }
  pass.end();
}
