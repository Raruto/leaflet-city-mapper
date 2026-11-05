import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from './destroyTexture.js';

export function resizeRenderer(backend, size) {
  const gpuCreateTexture1 = sharedState.allocationRenderResizeRendererCreateTexture1;
  if (!pluginState(backend)._size || !pluginState(backend)._size.equals(size)) {
    pluginState(backend).renderer.width = size.x;
    pluginState(backend).renderer.height = size.y;
    pluginState(backend).renderer.canvas.width = Math.round(size.x * pluginState(backend).renderer.dpr);
    pluginState(backend).renderer.canvas.height = Math.round(size.y * pluginState(backend).renderer.dpr);
    pluginState(backend).renderer.canvas.style.width = `${size.x}px`;
    pluginState(backend).renderer.canvas.style.height = `${size.y}px`;
    if (pluginState(backend).renderer.depthTexture) destroyTexture(backend, pluginState(backend).renderer.depthTexture);
    pluginState(backend).renderer.depthTexture = pluginState(backend).renderer.device.createTexture((
      gpuCreateTexture1.size[0] = pluginState(backend).renderer.canvas.width,
      gpuCreateTexture1.size[1] = pluginState(backend).renderer.canvas.height,
      gpuCreateTexture1.usage = GPUTextureUsage.RENDER_ATTACHMENT,
      gpuCreateTexture1
    ));
    pluginState(backend)._size = size;
  }
}
