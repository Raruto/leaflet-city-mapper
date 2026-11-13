import { roofShader } from '../globals/roofShader.js';
import { roofPipeline } from '../globals/roofPipeline.js';
import { roofBlitSampler } from '../globals/roofBlitSampler.js';

/**
 * Create the roof-atlas blit pipeline and sampler if they do not yet exist.
 *
 * @param {Object} renderer Renderer owning the GPU device and blit state.
 */
export function ensureRoofBlit(renderer) {
  const device = renderer.device;
  if (!renderer.roofBlit) {
    const module = device.createShaderModule(roofShader);
    renderer.roofBlit = /* alloc */ {
      pipeline: device.createRenderPipeline((
      roofPipeline.vertex.module = module,
      roofPipeline.fragment.module = module,
      roofPipeline
    )),
      sampler: device.createSampler(roofBlitSampler),
    };
    roofPipeline.vertex.module = null;
    roofPipeline.fragment.module = null;
  }
}
