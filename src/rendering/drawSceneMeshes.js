import { drawGeometry } from './drawGeometry.js';

export function drawSceneMeshes(backend, encoder, meshes) {
  const renderer = backend.renderer;
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: renderer.context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
    depthStencilAttachment: {
      view: renderer.depthTexture.createView(),
      depthClearValue: 1,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    },
  });
  pass.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height, 0, 1);
  pass.setBindGroup(1, renderer.sunlight.bindGroup);
  for (const mesh of meshes) {
    const world = mesh.worldMatrix;
    if (mesh.texture) {
      mesh.program.uniforms.baseTexture.value = mesh.texture;
      mesh.program.uniforms.opacity.value = mesh.opacity;
    }
    const uniforms = mesh.program.uniforms;
    if (uniforms.roofTexture) uniforms.roofTexture.value = backend._roofRaster?.texture || renderer.roofFallbackTexture;
    if (!mesh._frontFace || mesh._frontFaceWorldVersion !== mesh._worldMatrixVersion ||
        mesh._worldMatrixVersion === undefined) {
      const determinant = world[0] * (world[5] * world[10] - world[6] * world[9]) -
        world[4] * (world[1] * world[10] - world[2] * world[9]) +
        world[8] * (world[1] * world[6] - world[2] * world[5]);
      if (!Number.isFinite(determinant) || determinant === 0) {
        throw new Error('Singular 3D transform');
      }
      mesh._frontFace = determinant < 0 ? 'cw' : 'ccw';
      mesh._frontFaceWorldVersion = mesh._worldMatrixVersion;
    }
    const frontFace = mesh._frontFace;
    const program = mesh.program;
    if (program.transparent && program._layerMaterial.doubleSided && !mesh._nativeSource) {
      drawGeometry(backend, mesh, pass, 'front', frontFace);
      drawGeometry(backend, mesh, pass, 'back', frontFace);
    } else {
      drawGeometry(backend, mesh, pass, program.cullMode, frontFace);
    }
  }
  pass.end();
}
