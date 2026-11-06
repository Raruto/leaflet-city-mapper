import { frameBuffer } from '../globals/frameBuffer.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { destroyTexture } from './destroyTexture.js';

export function prepareFrameBuffer(backend, meshes, shadowMeshes) {
  const renderer = sceneByLayer.get(backend).renderer;
  // Slot 0 holds the camera; 256-byte mesh slots follow (double-sided meshes use two).
  if (!renderer.uniformBuffer || renderer.uniformBuffer.size < (meshes.length * 2 + shadowMeshes.length + 1) * 256) {
    if (renderer.uniformBuffer) destroyTexture(backend, renderer.uniformBuffer);
    renderer.uniformBuffer = renderer.device.createBuffer((
      frameBuffer.size = Math.max(64, meshes.length * 4 + shadowMeshes.length * 2) * 256,
      frameBuffer.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      frameBuffer
    ));
    renderer.uniformData = /* alloc */ new Float32Array(renderer.uniformBuffer.size / 4);
  }
}
