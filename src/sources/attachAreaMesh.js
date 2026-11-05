import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from '../rendering/createProgram.js';

import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';
import { instanceAreaGeometry } from './instanceAreaGeometry.js';

export function attachAreaMesh(context) {
  const { backend, area } = context;
  if (!context.positions.length) {
    area.mesh = null, area.buildings = 0, area.skipped = context.skipped, area.done = true;
    return;
  }
  const device = pluginState(backend).renderer.device;
  const data = instanceAreaGeometry(context);
  const attributes = /* allocation: required -- Keep GPU attributes independent for this retained mesh. */ {
    position: /* allocation: required -- Retain typed vertex positions with this mesh. */ { size: 3, data: /* allocation: required -- Keep GPU-ready position data owned by this mesh. */ new Float32Array(data.positions) },
    normal: /* allocation: required -- Retain typed vertex normals with this mesh. */ { size: 3, data: /* allocation: required -- Keep GPU-ready normal data owned by this mesh. */ new Float32Array(data.normals) },
    color: /* allocation: required -- Retain typed vertex colors with this mesh. */ { size: 3, data: /* allocation: required -- Keep GPU-ready color data owned by this mesh. */ new Float32Array(data.colors) },
  };
  if (data.instanceOffsets) attributes.instanceOffset = /* allocation: required -- Retain this mesh's per-instance offsets. */ { size: 4, data: data.instanceOffsets };
  if (backend.options.nightLight) attributes.uv = /* allocation: required -- Retain typed UV data with this mesh. */ { size: 2, data: /* allocation: required -- Keep GPU-ready UV data owned by this mesh. */ new Float32Array(context.uvs) };
  let name, attribute;
  for (name in attributes) {
    attribute = attributes[name];
    attribute.count = attribute.data.length / attribute.size;
    attribute.buffer = device.createBuffer(/* allocation: required -- Supply a fresh GPU vertex-buffer descriptor. */ {
      size: Math.max(4, attribute.data.byteLength),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  const meshGeometry = /* allocation: required -- Retain independent geometry metadata with this mesh. */ {
    device,
    attributes,
    drawRange: /* allocation: required -- Keep this mesh's draw range independently mutable. */ { start: 0, count: attributes.position.count },
  };
  area.mesh = /* allocation: required -- Retain the distinct feature mesh for this source area. */ {
      ...emptyNode(),
      device,
      geometry: meshGeometry,
      program: createProgram(backend, /* allocation: required -- Configure this mesh's independent shader material. */ {
        instanced: Boolean(data.instanceOffsets),
        vertexColors: true, roofTexture: Boolean(backend.options.roofTexture),
        nightLight: Boolean(backend.options.nightLight),
        alphaMode: backend.options.nightLight ? 'BLEND' : undefined,
        doubleSided: Boolean(backend.options.nightLight),
      }),
      id: sharedState.nextId++,
      renderOrder: 0,
      fadeDuration: 250,
      extras: /* allocation: required -- Keep picking ranges and lights tied to this mesh. */ { featureFaces: context.featureFaces, lights: context.lights },
    };
  area.buildings = context.featureFaces.length;
  area.skipped = context.skipped;
  area.done = true;
  setParent(area.mesh, pluginState(backend).root);
  update(backend);
}
