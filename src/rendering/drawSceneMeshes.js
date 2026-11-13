import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { scenePass } from '../globals/scenePass.js';
import { drawGeometry } from './drawGeometry.js';

/**
 * Encode the scene render pass, including both faces of double-sided transparent meshes.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {GPUCommandEncoder} encoder Encoder receiving the pass.
 * @param {Array<Object>} meshes Sorted meshes to draw.
 *
 * @throws {Error} If a mesh has a singular or non-finite world transform.
 */
export function drawSceneMeshes(layer, encoder, meshes) {
  const renderer = rendererByLayer.get(layer);
  const pass = encoder.beginRenderPass((
    scenePass.colorAttachments[0].view = renderer.colorTexture.createView(),
    scenePass.colorAttachments[0].resolveTarget = renderer.context.getCurrentTexture().createView(),
    scenePass.depthStencilAttachment.view = renderer.depthTexture.createView(),
    scenePass
  ));
  scenePass.colorAttachments[0].view = null;
  scenePass.colorAttachments[0].resolveTarget = null;
  scenePass.depthStencilAttachment.view = null;
  pass.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height, 0, 1);
  pass.setBindGroup(1, renderer.sunlight.bindGroup);
  let mesh, world, uniforms, determinant, frontFace, program;
  for (mesh of meshes) {
    world = mesh.worldMatrix;
    if (mesh.texture) {
      mesh.program.uniforms.baseTexture.value = mesh.texture;
      mesh.program.uniforms.opacity.value = mesh.opacity;
    }
    uniforms = mesh.program.uniforms;
    if (uniforms.roofTexture) uniforms.roofTexture.value = roofRasterByLayer.get(layer)?.texture || renderer.roofFallbackTexture;
    if (!mesh._frontFace || mesh._frontFaceWorldVersion !== mesh._worldMatrixVersion ||
        mesh._worldMatrixVersion === undefined) {
      determinant = world[0] * (world[5] * world[10] - world[6] * world[9]) -
        world[4] * (world[1] * world[10] - world[2] * world[9]) +
        world[8] * (world[1] * world[6] - world[2] * world[5]);
      if (!Number.isFinite(determinant) || determinant === 0) {
        throw /* alloc */ new Error('Singular 3D transform');
      }
      mesh._frontFace = determinant < 0 ? 'cw' : 'ccw';
      mesh._frontFaceWorldVersion = mesh._worldMatrixVersion;
    }
    frontFace = mesh._frontFace;
    program = mesh.program;
    if (program.transparent && program._layerMaterial.doubleSided && !mesh._nativeSource) {
      drawGeometry(layer, mesh, pass, 'front', frontFace);
      drawGeometry(layer, mesh, pass, 'back', frontFace);
    } else {
      drawGeometry(layer, mesh, pass, program.cullMode, frontFace);
    }
  }
  pass.end();
}
