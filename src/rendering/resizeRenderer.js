import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sizeByLayer } from '../weakmaps/sizeByLayer.js';
import { depthTexture as sharedDepthTexture } from '../globals/depthTexture.js';
import { colorTexture as sharedColorTexture } from '../globals/colorTexture.js';
import { destroyTexture } from '../textures/destroyTexture.js';

/**
 * Resize the renderer's canvas and recreate its color and depth textures when the map size changes.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {L.Point} size Viewport size in CSS pixels.
 */
export function resizeRenderer(layer, size) {
  const renderer = rendererByLayer.get(layer);
  if (!sizeByLayer.get(layer) || !sizeByLayer.get(layer).equals(size)) {
    renderer.width = size.x;
    renderer.height = size.y;
    renderer.canvas.width = Math.round(size.x * renderer.dpr);
    renderer.canvas.height = Math.round(size.y * renderer.dpr);
    renderer.canvas.style.width = `${size.x}px`;
    renderer.canvas.style.height = `${size.y}px`;
    if (renderer.depthTexture) destroyTexture(layer, renderer.depthTexture);
    renderer.colorTexture?.destroy();
    renderer.colorTexture = renderer.device.createTexture((
      sharedColorTexture.size[0] = renderer.canvas.width,
      sharedColorTexture.size[1] = renderer.canvas.height,
      sharedColorTexture.format = renderer.format,
      sharedColorTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT,
      sharedColorTexture
    ));
    renderer.depthTexture = renderer.device.createTexture((
      sharedDepthTexture.size[0] = renderer.canvas.width,
      sharedDepthTexture.size[1] = renderer.canvas.height,
      sharedDepthTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT,
      sharedDepthTexture
    ));
    sizeByLayer.set(layer, size);
  }
}
