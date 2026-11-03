
export function bindSunlight(backend) {
  const sun = backend.renderer.sunlight;
  sun.bindGroup = backend.renderer.device.createBindGroup({
    layout: sun.layout, entries: [
      { binding: 0, resource: { buffer: sun.buffer } },
      { binding: 1, resource: sun.texture.createView() },
      { binding: 2, resource: sun.sampler },
      { binding: 3, resource: { buffer: sun.lights } },
    ]
  });
}
