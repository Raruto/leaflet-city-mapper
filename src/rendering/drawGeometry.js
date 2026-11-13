import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { meshOffsets } from '../globals/meshOffsets.js';
import { drawPipeline } from './drawPipeline.js';
import { prepareMeshUniforms } from './prepareMeshUniforms.js';
import { prepareMeshTextures } from '../textures/prepareMeshTextures.js';

/**
 * Upload modified CPU attributes and draw one mesh in the active WebGPU render pass.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {Object} mesh Mesh to draw.
 * @param {GPURenderPassEncoder} pass Active render pass.
 * @param {GPUCullMode} cullMode Pipeline face-culling mode.
 * @param {GPUFrontFace} frontFace Pipeline front-face winding.
 */
export function drawGeometry(layer, mesh, pass, cullMode, frontFace) {
  const { geometry } = mesh, { attributes, drawRange } = geometry;
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

  pass.setVertexBuffer(0, attributes.position.buffer);
  pass.setVertexBuffer(1, attributes.normal.buffer);
  if (attributes.color) pass.setVertexBuffer(2, attributes.color.buffer);
  if (attributes.uv) pass.setVertexBuffer(3, attributes.uv.buffer);
  const instances = attributes.instanceOffset;
  if (instances) pass.setVertexBuffer(4, instances.buffer);
  let name, attribute;
  for (name in attributes) {
    attribute = attributes[name];
    if (!attribute.needsUpdate) continue;
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    attribute.needsUpdate = false;
    if (name === 'position' || name === 'instanceOffset') geometry.bounds = null;
  }
  const index = attributes.index;
  if (index) {
    pass.setIndexBuffer(index.buffer, index.indexFormat);
    pass.drawIndexed(drawRange.count, instances?.count ?? 1, drawRange.start, 0, 0);
  } else {
    pass.draw(drawRange.count, instances?.count ?? 1, drawRange.start, 0);
  }
}
