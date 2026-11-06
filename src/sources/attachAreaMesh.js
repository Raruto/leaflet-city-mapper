import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { nextId } from '../globals/nextId.js';


import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from '../rendering/createProgram.js';

import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';
import { instanceAreaGeometry } from './instanceAreaGeometry.js';

export function attachAreaMesh(context) {
  const { backend: layer, area } = context;
  if (!context.positions.length) {
    area.mesh = null, area.buildings = 0, area.skipped = context.skipped, area.done = true;
    return;
  }
  const device = rendererByLayer.get(layer).device;
  const data = instanceAreaGeometry(context);
  const attributes = /* alloc */ {
    position: /* alloc */ { size: 3, data: /* alloc */ new Float32Array(data.positions) },
    normal: /* alloc */ { size: 3, data: /* alloc */ new Float32Array(data.normals) },
    color: /* alloc */ { size: 3, data: /* alloc */ new Float32Array(data.colors) },
  };
  if (data.instanceOffsets) attributes.instanceOffset = /* alloc */ { size: 4, data: data.instanceOffsets };
  if (layer.options.nightLight) attributes.uv = /* alloc */ { size: 2, data: /* alloc */ new Float32Array(context.uvs) };
  let name, attribute;
  for (name in attributes) {
    attribute = attributes[name];
    attribute.count = attribute.data.length / attribute.size;
    attribute.buffer = device.createBuffer(/* alloc */ {
      size: Math.max(4, attribute.data.byteLength),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  const meshGeometry = /* alloc */ {
    device,
    attributes,
    drawRange: /* alloc */ { start: 0, count: attributes.position.count },
  };
  area.mesh = /* alloc */ {
      ...emptyNode(),
      device,
      geometry: meshGeometry,
      program: createProgram(layer, /* alloc */ {
        instanced: Boolean(data.instanceOffsets),
        vertexColors: true, roofTexture: layer.options.roofTexture,
        wallTexture: layer.options.wallTexture,
        nightLight: Boolean(layer.options.nightLight),
        alphaMode: layer.options.nightLight ? 'BLEND' : undefined,
        doubleSided: Boolean(layer.options.nightLight),
      }),
      id: nextId.value++,
      renderOrder: 0,
      fadeDuration: 250,
      extras: /* alloc */ { featureFaces: context.featureFaces, lights: context.lights },
    };
  area.buildings = context.featureFaces.length;
  area.skipped = context.skipped;
  area.done = true;
  setParent(area.mesh, rootByLayer.get(layer));
  update(layer);
}
