import { depthTexture as sharedDepthTexture } from '../globals/depthTexture.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { destroyTexture } from './destroyTexture.js';

export function resizeRenderer(backend, size) {
  if (!sceneByLayer.get(backend)._size || !sceneByLayer.get(backend)._size.equals(size)) {
    sceneByLayer.get(backend).renderer.width = size.x;
    sceneByLayer.get(backend).renderer.height = size.y;
    sceneByLayer.get(backend).renderer.canvas.width = Math.round(size.x * sceneByLayer.get(backend).renderer.dpr);
    sceneByLayer.get(backend).renderer.canvas.height = Math.round(size.y * sceneByLayer.get(backend).renderer.dpr);
    sceneByLayer.get(backend).renderer.canvas.style.width = `${size.x}px`;
    sceneByLayer.get(backend).renderer.canvas.style.height = `${size.y}px`;
    if (sceneByLayer.get(backend).renderer.depthTexture) destroyTexture(backend, sceneByLayer.get(backend).renderer.depthTexture);
    sceneByLayer.get(backend).renderer.depthTexture = sceneByLayer.get(backend).renderer.device.createTexture((
      sharedDepthTexture.size[0] = sceneByLayer.get(backend).renderer.canvas.width,
      sharedDepthTexture.size[1] = sceneByLayer.get(backend).renderer.canvas.height,
      sharedDepthTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT,
      sharedDepthTexture
    ));
    sceneByLayer.get(backend)._size = size;
  }
}
