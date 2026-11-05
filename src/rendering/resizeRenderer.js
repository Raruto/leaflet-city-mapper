import { destroyTexture } from './destroyTexture.js';

export function resizeRenderer(backend, size) {
  if (!backend._size || !backend._size.equals(size)) {
    backend.renderer.width = size.x;
    backend.renderer.height = size.y;
    backend.renderer.canvas.width = Math.round(size.x * backend.renderer.dpr);
    backend.renderer.canvas.height = Math.round(size.y * backend.renderer.dpr);
    backend.renderer.canvas.style.width = `${size.x}px`;
    backend.renderer.canvas.style.height = `${size.y}px`;
    if (backend.renderer.depthTexture) destroyTexture(backend, backend.renderer.depthTexture);
    backend.renderer.depthTexture = backend.renderer.device.createTexture({
      size: [backend.renderer.canvas.width, backend.renderer.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    backend._size = size;
  }
}
