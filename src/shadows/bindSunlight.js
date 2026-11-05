import { sunBindGroup } from '../globals/sunBindGroup.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



export function bindSunlight(layer) {
  const sun = sceneByLayer.get(layer).renderer.sunlight;
  sun.bindGroup = sceneByLayer.get(layer).renderer.device.createBindGroup((
    sunBindGroup.layout = sun.layout,
    sunBindGroup.entries[0].resource.buffer = sun.buffer,
    sunBindGroup.entries[1].resource = sun.texture.createView(),
    sunBindGroup.entries[2].resource = sun.sampler,
    sunBindGroup.entries[3].resource.buffer = sun.lights,
    sunBindGroup
  ));
  sunBindGroup.layout = null;
  sunBindGroup.entries[0].resource.buffer = null;
  sunBindGroup.entries[1].resource = null;
  sunBindGroup.entries[2].resource = null;
  sunBindGroup.entries[3].resource.buffer = null;
}
