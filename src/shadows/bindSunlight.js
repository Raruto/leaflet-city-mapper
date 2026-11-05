import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

export function bindSunlight(layer) {
  const gpuCreateBindGroup1 = sharedState.allocationRenderBindSunlightCreateBindGroup1;
  const sun = pluginState(layer).renderer.sunlight;
  sun.bindGroup = pluginState(layer).renderer.device.createBindGroup((
    gpuCreateBindGroup1.layout = sun.layout,
    gpuCreateBindGroup1.entries[0].resource.buffer = sun.buffer,
    gpuCreateBindGroup1.entries[1].resource = sun.texture.createView(),
    gpuCreateBindGroup1.entries[2].resource = sun.sampler,
    gpuCreateBindGroup1.entries[3].resource.buffer = sun.lights,
    gpuCreateBindGroup1
  ));
  gpuCreateBindGroup1.layout = null;
  gpuCreateBindGroup1.entries[0].resource.buffer = null;
  gpuCreateBindGroup1.entries[1].resource = null;
  gpuCreateBindGroup1.entries[2].resource = null;
  gpuCreateBindGroup1.entries[3].resource.buffer = null;
}
