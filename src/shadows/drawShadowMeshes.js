import { shadowPass } from '../globals/shadowPass.js';
import { shadowBindGroup } from '../globals/shadowBindGroup.js';
import { shadowOffsets } from '../globals/shadowOffsets.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


export function drawShadowMeshes(backend, encoder, meshes) {
  const renderer = sceneByLayer.get(backend).renderer, device = renderer.device, sun = renderer.sunlight;
  const pass = encoder.beginRenderPass((
    shadowPass.depthStencilAttachment.view = sun.texture.createView(),
    shadowPass
  ));
  shadowPass.depthStencilAttachment.view = null;
  let pipeline = sun.pipeline;
  pass.setPipeline(pipeline);
  pass.setBindGroup(1, sun.depthBindGroup);
  let mesh, instances, nextPipeline, offset, attribute, index, range;
  for (mesh of meshes) {
    instances = mesh.geometry.attributes.instanceOffset;
    nextPipeline = instances ? sun.instancePipeline : sun.pipeline;
    if (nextPipeline !== pipeline) {
      pipeline = nextPipeline;
      pass.setPipeline(pipeline);
    }
    offset = renderer.uniformSlot++ * 256;
    renderer.uniformData.set(mesh.worldMatrix, offset / 4);
    renderer.uniformData[offset / 4 + 35] = mesh._appearance ?? 1;
    if (mesh._shadowBuffer !== renderer.uniformBuffer) {
      mesh._shadowBuffer = renderer.uniformBuffer;
      mesh._shadowBindGroup = device.createBindGroup((
        shadowBindGroup.layout = sun.meshLayout,
        shadowBindGroup.entries[0].resource.buffer = renderer.uniformBuffer,
        shadowBindGroup
      ));
      shadowBindGroup.layout = null;
      shadowBindGroup.entries[0].resource.buffer = null;
    }
    for (attribute of Object.values(mesh.geometry.attributes)) {
      if (attribute.needsUpdate) {
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
        attribute.needsUpdate = false;
      }
    }
    pass.setBindGroup(0, mesh._shadowBindGroup, (
      shadowOffsets[0] = offset,
      shadowOffsets
    ));

    pass.setVertexBuffer(0, mesh.geometry.attributes.position.buffer);
    if (instances) pass.setVertexBuffer(1, instances.buffer);
    index = mesh.geometry.attributes.index, range = mesh.geometry.drawRange;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(range.count, instances?.count ?? 1, range.start, 0, 0);
    } else pass.draw(range.count, instances?.count ?? 1, range.start, 0);
  }
  pass.end();
}
