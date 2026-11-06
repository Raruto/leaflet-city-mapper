import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { meshOffsets } from '../globals/meshOffsets.js';
import { drawPipeline } from './drawPipeline.js';
import { prepareMeshUniforms } from './prepareMeshUniforms.js';
import { prepareMeshTextures } from './prepareMeshTextures.js';

/** Upload retained CPU data and draw one mesh in the active WebGPU render pass. */
export function drawGeometry(layer, mesh, pass, cullMode, frontFace) {
  const { geometry } = mesh;
  const renderer = rendererByLayer.get(layer);
  const { device } = renderer;
  const pipeline = drawPipeline(renderer, mesh, cullMode, frontFace);
  const offset = prepareMeshUniforms(renderer, mesh);
  prepareMeshTextures(renderer, mesh);
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, mesh.bindGroup, (
    meshOffsets[0] = offset,
    meshOffsets
  ));

  pass.setVertexBuffer(0, geometry.attributes.position.buffer);
  pass.setVertexBuffer(1, geometry.attributes.normal.buffer);
  if (geometry.attributes.color) pass.setVertexBuffer(2, geometry.attributes.color.buffer);
  if (geometry.attributes.uv) pass.setVertexBuffer(3, geometry.attributes.uv.buffer);
  const instances = geometry.attributes.instanceOffset;
  if (instances) pass.setVertexBuffer(4, instances.buffer);
  let attribute;
  for (attribute of Object.values(geometry.attributes)) {
    if (!attribute.needsUpdate) continue;
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    attribute.needsUpdate = false;
    geometry.bounds = null;
  }
  const index = geometry.attributes.index;
  if (index) {
    pass.setIndexBuffer(index.buffer, index.indexFormat);
    pass.drawIndexed(geometry.drawRange.count, instances?.count ?? 1, geometry.drawRange.start, 0, 0);
  } else {
    pass.draw(geometry.drawRange.count, instances?.count ?? 1, geometry.drawRange.start, 0);
  }
}
