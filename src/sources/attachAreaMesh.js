import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from '../rendering/createProgram.js';
import { cityMapper } from '../constants/cityMapper.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';
import { instanceAreaGeometry } from './instanceAreaGeometry.js';

export function attachAreaMesh(context) {
  const { backend, area } = context;
  if (!context.positions.length) {
    Object.assign(area, { mesh: null, buildings: 0, skipped: context.skipped, done: true });
    return;
  }
  const device = backend.renderer.device;
  const data = instanceAreaGeometry(context);
  const attributes = {
    position: { size: 3, data: new Float32Array(data.positions) },
    normal: { size: 3, data: new Float32Array(data.normals) },
    color: { size: 3, data: new Float32Array(data.colors) },
  };
  if (data.instanceOffsets) attributes.instanceOffset = { size: 4, data: data.instanceOffsets };
  if (backend.options.nightLight) attributes.uv = { size: 2, data: new Float32Array(context.uvs) };
  for (const [name, attribute] of Object.entries(attributes)) {
    attribute.count = attribute.data.length / attribute.size;
    attribute.buffer = device.createBuffer({
      size: Math.max(4, attribute.data.byteLength),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  const meshGeometry = {
    device,
    attributes,
    drawRange: { start: 0, count: attributes.position.count },
  };
  Object.assign(area, {
    mesh: {
      ...emptyNode(),
      device,
      geometry: meshGeometry,
      program: createProgram(backend, {
        instanced: Boolean(data.instanceOffsets),
        vertexColors: true, roofTexture: Boolean(backend.options.roofTexture),
        ...(backend.options.nightLight ? { nightLight: true, alphaMode: 'BLEND', doubleSided: true } : {}),
      }),
      id: cityMapper.nextId++,
      renderOrder: 0,
      fadeDuration: 250,
      extras: { featureFaces: context.featureFaces, lights: context.lights },
    },
    buildings: context.featureFaces.length,
    skipped: context.skipped,
    done: true,
  });
  setParent(area.mesh, backend.root);
  update(backend);
}
