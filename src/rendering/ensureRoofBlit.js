import { state as sharedState } from '../state.js';
export function ensureRoofBlit(renderer) {
  const gpuCreateShaderModule1 = sharedState.allocationRenderEnsureRoofBlitCreateShaderModule1;
  const gpuCreateRenderPipeline2 = sharedState.allocationRenderEnsureRoofBlitCreateRenderPipeline2;
  const gpuCreateSampler3 = sharedState.allocationRenderEnsureRoofBlitCreateSampler3;
  const device = renderer.device;
  if (!renderer.roofBlit) {
    const module = device.createShaderModule(gpuCreateShaderModule1);
    renderer.roofBlit = /* allocation: required -- Each renderer retains its own roof-blit pipeline and sampler. */ {
      pipeline: device.createRenderPipeline((
      gpuCreateRenderPipeline2.vertex.module = module,
      gpuCreateRenderPipeline2.fragment.module = module,
      gpuCreateRenderPipeline2
    )),
      sampler: device.createSampler(gpuCreateSampler3),
    };
    gpuCreateRenderPipeline2.vertex.module = null;
    gpuCreateRenderPipeline2.fragment.module = null;
  }
}
