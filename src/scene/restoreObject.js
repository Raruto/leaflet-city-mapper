import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { createProgram } from '../materials/createProgram.js';
import { restoreGeometry } from '../geometry/restoreGeometry.js';
import { restoreMaterialTextures } from '../textures/restoreMaterialTextures.js';

/**
 * Restore a scene object's GPU resources when it moves to a different device.
 *
 * @param {Object} object Scene object to restore.
 * @param {L.Layer} layer Layer containing the object.
 */
export function restoreObject(object, layer) {
  const shared = sharedByLayer.get(layer);
  let texture;
  if (object.geometry && object.geometry.device !== rendererByLayer.get(shared).device) {
    const geometry = object.geometry;
    const material = object.program._layerMaterial;
    const device = rendererByLayer.get(shared).device;
    restoreGeometry(geometry, device);
    object.bindGroup = null;
    if (object.boundTextures) object.boundTextures.length = 0;
    else object.boundTextures = /* alloc */ [];
    restoreMaterialTextures(material, device);
    object.program.pipelineCache.clear();
    object.program = createProgram(layer, material);
    object.device = device;
  }
  if (object.texture && object.texture.device !== rendererByLayer.get(shared).device) {
    texture = object.texture;
    texture.device = rendererByLayer.get(shared).device;
    texture.texture = rendererByLayer.get(shared).device.createTexture(/* alloc */ {
        size: /* alloc */ [object.texture.image.width, object.texture.image.height],
        format: object.texture.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
    texture.sampler = rendererByLayer.get(shared).device.createSampler(texture.samplerOptions);
    texture.uploaded = null;
  }
}
