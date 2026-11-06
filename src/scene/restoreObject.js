import { sceneByLayer } from '../globals/sceneByLayer.js';


import { createProgram } from '../rendering/createProgram.js';
import { restoreGeometry } from './restoreGeometry.js';
import { restoreMaterialTextures } from './restoreMaterialTextures.js';

export function restoreObject(object, backend) {
  const shared = sceneByLayer.get(backend)._shared;
  let texture;
  if (object.geometry && object.geometry.device !== sceneByLayer.get(shared).renderer.device) {
    const geometry = object.geometry;
    const material = object.program._layerMaterial;
    const device = sceneByLayer.get(shared).renderer.device;
    restoreGeometry(geometry, device);
    object.bindGroup = null;
    if (object.boundTextures) object.boundTextures.length = 0;
    else object.boundTextures = /* alloc */ [];
    restoreMaterialTextures(material, device);
    object.program.pipelineCache.clear();
    object.program = createProgram(backend, material);
    object.device = device;
  }
  if (object.texture && object.texture.device !== sceneByLayer.get(shared).renderer.device) {
    texture = object.texture;
    texture.device = sceneByLayer.get(shared).renderer.device;
    texture.texture = sceneByLayer.get(shared).renderer.device.createTexture(/* alloc */ {
        size: /* alloc */ [object.texture.image.width, object.texture.image.height],
        format: object.texture.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
    texture.sampler = sceneByLayer.get(shared).renderer.device.createSampler(texture.samplerOptions);
    texture.uploaded = null;
  }
}
