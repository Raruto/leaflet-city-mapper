import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sunBindGroup } from '../globals/sunBindGroup.js';

/**
 * Bind the renderer's sunlight uniforms, shadow texture, sampler and light buffer.
 *
 * @param {L.Layer} layer Layer owning the renderer.
 */
export function bindSunlight(layer) {
  const sun = rendererByLayer.get(layer).sunlight;
  sun.bindGroup = rendererByLayer.get(layer).device.createBindGroup((
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
