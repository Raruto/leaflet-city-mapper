import { roofShader } from '../globals/roofShader.js';
import { roofPipeline } from '../globals/roofPipeline.js';
import { roofBlitSampler } from '../globals/roofBlitSampler.js';

export function ensureRoofBlit(renderer) {
  const device = renderer.device;
  if (!renderer.roofBlit) {
    const module = device.createShaderModule(roofShader);
    renderer.roofBlit = /* allocation: required -- Each renderer retains its own roof-blit pipeline and sampler. */ {
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
