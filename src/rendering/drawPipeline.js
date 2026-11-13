import { meshPipeline } from '../globals/meshPipeline.js';
import { alphaBlend } from '../globals/alphaBlend.js';

/**
 * Get or create a cached render pipeline for a mesh and its face/depth settings.
 *
 * @param {Object} renderer Renderer providing the device and color format.
 * @param {Object} mesh Mesh providing the program and ground flag.
 * @param {GPUCullMode} cullMode Face-culling mode.
 * @param {GPUFrontFace} frontFace Front-face winding.
 *
 * @returns {GPURenderPipeline} Cached or newly created pipeline.
 */
export function drawPipeline(renderer, mesh, cullMode, frontFace) {
  const { program } = mesh;
  // Mixed-LOD imagery composites coarse-to-fine; its depth still occludes later 3D objects.
  // ponytail: self-occlusion during LOD blending needs separate per-LOD depth passes.
  const depthCompare = program.depthTest === false || (mesh.ground && renderer.groundOverlap)
    ? 'always' : 'less-equal';
  const pipelineKey = `${cullMode}:${frontFace}:${depthCompare}`;
  let pipeline = program.pipelineCache.get(pipelineKey);
  if (!pipeline) {
    pipeline = renderer.device.createRenderPipeline((
      meshPipeline.layout = program.pipelineLayout,
      meshPipeline.vertex.module = program.vertex,
      meshPipeline.vertex.buffers = program.vertexBuffers,
      meshPipeline.fragment.module = program.fragment,
      meshPipeline.fragment.targets[0].format = renderer.format,
      meshPipeline.fragment.targets[0].blend = program.transparent ? alphaBlend : undefined,
      meshPipeline.fragment.targets[0].writeMask = GPUColorWrite.ALL,
      meshPipeline.primitive.cullMode = cullMode,
      meshPipeline.primitive.frontFace = frontFace,
      meshPipeline.depthStencil.depthWriteEnabled = program.depthWrite,
      meshPipeline.depthStencil.depthCompare = depthCompare,
      meshPipeline
    ));
    meshPipeline.layout = null;
    meshPipeline.vertex.module = null;
    meshPipeline.vertex.buffers = null;
    meshPipeline.fragment.module = null;
    program.pipelineCache.set(pipelineKey, pipeline);
  }
  return pipeline;
}
