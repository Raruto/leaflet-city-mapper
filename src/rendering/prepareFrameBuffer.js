import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { frameBuffer } from '../globals/frameBuffer.js';
import { destroyTexture } from '../textures/destroyTexture.js';

export function prepareFrameBuffer(layer, meshes, shadowMeshes) {
  const renderer = rendererByLayer.get(layer);
  // Slot 0 holds the camera; 256-byte mesh slots follow (double-sided meshes use two).
  if (!renderer.uniformBuffer || renderer.uniformBuffer.size < (meshes.length * 2 + shadowMeshes.length + 1) * 256) {
    if (renderer.uniformBuffer) destroyTexture(layer, renderer.uniformBuffer);
    renderer.uniformBuffer = renderer.device.createBuffer((
      frameBuffer.size = Math.max(64, meshes.length * 4 + shadowMeshes.length * 2) * 256,
      frameBuffer.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      frameBuffer
    ));
    renderer.uniformData = /* alloc */ new Float32Array(renderer.uniformBuffer.size / 4);
  }
}
