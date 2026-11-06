import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sizeByLayer } from '../weakmaps/sizeByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { depthTexture as sharedDepthTexture } from '../globals/depthTexture.js';


import { destroyTexture } from './destroyTexture.js';

export function resizeRenderer(layer, size) {
  if (!sizeByLayer.get(layer) || !sizeByLayer.get(layer).equals(size)) {
    rendererByLayer.get(layer).width = size.x;
    rendererByLayer.get(layer).height = size.y;
    rendererByLayer.get(layer).canvas.width = Math.round(size.x * rendererByLayer.get(layer).dpr);
    rendererByLayer.get(layer).canvas.height = Math.round(size.y * rendererByLayer.get(layer).dpr);
    rendererByLayer.get(layer).canvas.style.width = `${size.x}px`;
    rendererByLayer.get(layer).canvas.style.height = `${size.y}px`;
    if (rendererByLayer.get(layer).depthTexture) destroyTexture(layer, rendererByLayer.get(layer).depthTexture);
    rendererByLayer.get(layer).depthTexture = rendererByLayer.get(layer).device.createTexture((
      sharedDepthTexture.size[0] = rendererByLayer.get(layer).canvas.width,
      sharedDepthTexture.size[1] = rendererByLayer.get(layer).canvas.height,
      sharedDepthTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT,
      sharedDepthTexture
    ));
    mutateWeakMap(sizeByLayer, layer, "=", size);
  }
}
