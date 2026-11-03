import { resizeSunlight } from './resizeSunlight.js';

/** Sunlight shadow maps and night point lights. */

export function initSunlight(backend) {
  const device = backend.renderer.device;
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'depth' } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'comparison' } },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
    ]
  });
  const buffer = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const sampler = device.createSampler({ compare: 'less-equal', minFilter: 'linear', magFilter: 'linear' });
  const lights = device.createBuffer({ size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  backend.renderer.sunlight = { layout, buffer, sampler, lights, size: 0 };
  const values = new Float32Array(20);
  values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  device.queue.writeBuffer(buffer, 0, values);
  resizeSunlight(backend, 1);
}
