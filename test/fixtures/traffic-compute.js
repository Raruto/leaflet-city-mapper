import { trafficShader } from '../../src/traffic/rendering/constants/trafficShader.js';
import { vehicles } from '../../src/traffic/vehicles/constants/vehicles.js';
import { build } from '../../src/geometry/build.js';
import { along } from '../../src/traffic/simulation/along.js';

/** Exercise the real GPU shader independently of map loading and animation-frame throttling. */
export async function checkTrafficCompute(device) {
  const module = device.createShaderModule({ code: trafficShader });
  const info = await module.getCompilationInfo();
  const errors = info.messages.filter(isShaderError);
  if (errors.length) throw new Error(errors.map(shaderMessage).join('\n'));
  const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } });
  const results = [];
  for (const mode of Object.keys(vehicles)) results.push(await checkModel(device, pipeline, mode));
  return results;
}

function isShaderError(message) {
  return message.type === 'error';
}

function shaderMessage(message) {
  return message.message;
}

async function checkModel(device, pipeline, mode) {
  const model = build(vehicles[mode].model(0)), vertices = model.position.length / 3;
  const points = [[0, 0, 10], [50, 0, 20], [50, 0, 20], [50, 50, 30]];
  const lengths = [0, 50, 50, 100], side = vehicles[mode].side;
  const distances = [0, 49, 50, 75, 99], count = distances.length;
  const buffers = [];
  try {
    const params = new ArrayBuffer(16);
    new Float32Array(params).set([0.25, side]);
    new Uint32Array(params).set([vertices, count * vertices], 2);
    const inputs = [
      new Uint8Array(params), new Float32Array([...model.position, ...model.normal]),
      new Float32Array([0, 0, 10, 0, 50, 0, 20, 50, 50, 0, 20, 50, 50, 50, 30, 100]),
      new Float32Array(count * 4),
    ];
    const trips = inputs[3], ints = new Uint32Array(trips.buffer);
    for (let i = 0; i < count; i++) {
      ints[i * 4] = 0; ints[i * 4 + 1] = 4;
      trips[i * 4 + 2] = distances[i]; trips[i * 4 + 3] = 4;
    }
    for (const [i, data] of inputs.entries()) {
      const buffer = device.createBuffer({ size: data.byteLength,
        usage: (i ? GPUBufferUsage.STORAGE : GPUBufferUsage.UNIFORM) | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(buffer, 0, data);
      buffers.push(buffer);
    }
    const bytes = count * model.position.length * 4;
    for (let i = 0; i < 2; i++) buffers.push(device.createBuffer({
      size: bytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    }));
    const read = device.createBuffer({ size: bytes * 2, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    buffers.push(read);
    const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: buffers.slice(0, 6).map(bufferBinding) });
    const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
    pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.dispatchWorkgroups(count); pass.end();
    encoder.copyBufferToBuffer(buffers[4], 0, read, 0, bytes);
    encoder.copyBufferToBuffer(buffers[5], 0, read, bytes, bytes);
    device.queue.submit([encoder.finish()]);
    await read.mapAsync(GPUMapMode.READ);
    const actual = new Float32Array(read.getMappedRange());
    let error = 0;
    for (let i = 0; i < count; i++) {
      const distance = (distances[i] + 1) % 100;
      const { x, y, z, dx, dz } = along(points, lengths, distance);
      for (let k = 0; k < model.position.length; k += 3) {
        const o = i * model.position.length + k;
        const lx = model.position[k], lz = model.position[k + 2], nx = model.normal[k], nz = model.normal[k + 2];
        const expected = [x - dz * side - lx * dz - lz * dx, y + model.position[k + 1],
          z + dx * side + lx * dx - lz * dz, -nx * dz - nz * dx, model.normal[k + 1], nx * dx - nz * dz];
        for (let axis = 0; axis < 3; axis++) {
          error = Math.max(error, Math.abs(actual[o + axis] - expected[axis]),
            Math.abs(actual[bytes / 4 + o + axis] - expected[axis + 3]));
        }
      }
    }
    read.unmap();
    if (!Number.isFinite(error) || error > 0.0001) throw new Error(`${mode}: GPU pose error ${error}`);
    return { mode, vertices, count, error };
  } finally {
    for (const buffer of buffers) buffer.destroy();
  }
}

function bufferBinding(buffer, binding) {
  return { binding, resource: { buffer } };
}
