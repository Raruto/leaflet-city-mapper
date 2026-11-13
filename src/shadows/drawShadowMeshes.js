import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { shadowPass } from '../globals/shadowPass.js';
import { shadowBindGroup } from '../globals/shadowBindGroup.js';
import { shadowOffsets } from '../globals/shadowOffsets.js';

/**
 * Encode the shadow depth pass for the supplied meshes.
 *
 * @param {L.Layer} layer Layer owning the renderer.
 * @param {GPUCommandEncoder} encoder Encoder receiving the render pass.
 * @param {Object[]} meshes Meshes to draw into the depth texture.
 */
export function drawShadowMeshes(layer, encoder, meshes) {
  const renderer = rendererByLayer.get(layer), device = renderer.device, sun = renderer.sunlight;
  const pass = encoder.beginRenderPass((
    shadowPass.depthStencilAttachment.view = sun.texture.createView(),
    shadowPass
  ));
  shadowPass.depthStencilAttachment.view = null;
  let pipeline = sun.pipeline;
  pass.setPipeline(pipeline);
  pass.setBindGroup(1, sun.depthBindGroup);
  let mesh, attributes, instances, nextPipeline, offset, attribute, index, range;
  for (mesh of meshes) {
    attributes = mesh.geometry.attributes;
    instances = attributes.instanceOffset;
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
    for (attribute of Object.values(attributes)) {
      if (attribute.needsUpdate) {
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
        attribute.needsUpdate = false;
      }
    }
    pass.setBindGroup(0, mesh._shadowBindGroup, (
      shadowOffsets[0] = offset,
      shadowOffsets
    ));

    pass.setVertexBuffer(0, attributes.position.buffer);
    if (instances) pass.setVertexBuffer(1, instances.buffer);
    index = attributes.index, range = mesh.geometry.drawRange;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(range.count, instances?.count ?? 1, range.start, 0, 0);
    } else pass.draw(range.count, instances?.count ?? 1, range.start, 0);
  }
  pass.end();
}
