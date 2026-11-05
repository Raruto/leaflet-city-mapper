
export function bindSunlight(layer) {
  const sun = layer.renderer.sunlight;
  sun.bindGroup = layer.renderer.device.createBindGroup({
    layout: sun.layout, entries: [
      { binding: 0, resource: { buffer: sun.buffer } },
      { binding: 1, resource: sun.texture.createView() },
      { binding: 2, resource: sun.sampler },
      { binding: 3, resource: { buffer: sun.lights } },
    ]
  });
}
