import { cityMapper } from '../constants/cityMapper.js';
import { emptyNode } from '../scene/emptyNode.js';
import { nodeMatrix } from './nodeMatrix.js';
import { readAccessor } from './readAccessor.js';
import { setParent } from '../scene/setParent.js';
import { vertexNormals } from '../geometry/vertexNormals.js';
import { createProgram } from '../rendering/createProgram.js';

export function modelNode(context, index) {
  const { backend, description, materials, active, resources } = context;
  // Track only the recursion path: shared mesh references are valid, cycles are not.
  if (active.has(index)) throw new Error('Cyclic glTF nodes');
  const spec = description.nodes[index];
  if (!spec) throw new Error('Invalid glTF node');
  active.add(index);
  const group = {
    ...emptyNode(),
    name: spec.name
  };
  group.matrix = nodeMatrix(spec);
  let primitive, attributes, semantic, name, vertexCount, attribute, index2, i, normals, style, program;
  let device, geometry, mesh, child;
  if (spec.mesh !== undefined) {
    for (primitive of description.meshes[spec.mesh].primitives) {
      attributes = {};
      for ([semantic, name] of [['POSITION', 'position'], ['NORMAL', 'normal'], ['TEXCOORD_0', 'uv']]) {
        if (primitive.attributes[semantic] !== undefined) attributes[name] = readAccessor(description, primitive.attributes[semantic]);
      }
      if (!attributes.position) throw new Error('glTF mesh has no positions');
      vertexCount = attributes.position.data.length / 3;
      if (attributes.position.size !== 3 || vertexCount < 3) throw new Error('Invalid glTF vertex attributes');
      for (attribute of Object.values(attributes)) {
        if (attribute.data.length / attribute.size !== vertexCount) throw new Error('Invalid glTF vertex attributes');
      }
      if (primitive.indices !== undefined) {
        index2 = readAccessor(description, primitive.indices);
        attributes.index = { size: 1, data: index2.indices };
        if (!(index2.indices instanceof Uint8Array || index2.indices instanceof Uint16Array || index2.indices instanceof Uint32Array) ||
          index2.size !== 1 || index2.indices.length % 3) throw new Error('Invalid glTF triangle indices');
        for (i of index2.indices) {
          if (i >= vertexCount) throw new Error('Invalid glTF triangle indices');
        }
      }
      if (!attributes.index && vertexCount % 3) throw new Error('Incomplete glTF triangle');
      if (!attributes.normal) {
        normals = vertexNormals(attributes.position.data, attributes.index?.data);
        attributes.normal = { size: 3, data: normals };
      }
      style = materials[primitive.material] || { color: [1, 1, 1], metallic: 1 };
      if ((style.baseTexture || style.metalTexture || style.emissiveTexture || style.occlusionTexture) && !attributes.uv) {
        throw new Error('Textured model mesh requires UV coordinates');
      }
      program = createProgram(backend, style);
      resources.push(program);
      device = backend.renderer.device;
      if (attributes.index?.data instanceof Uint8Array) {
        attributes.index.data = Uint16Array.from(attributes.index.data);
      }
      for ([name, attribute] of Object.entries(attributes)) {
        attribute.size ||= 1;
        attribute.count = attribute.data.length / attribute.size;
        attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
        attribute.buffer = device.createBuffer({
          size: Math.max(4, attribute.data.byteLength),
          usage: name === 'index'
            ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      }
      geometry = {
        device,
        attributes,
        drawRange: { start: 0, count: attributes.index?.count || attributes.position.count },
      };
      resources.push(geometry);
      mesh = {
        ...emptyNode(),
        device,
        geometry,
        program,
        fadeDuration: 250,
        id: cityMapper.nextId++,
        renderOrder: 0
      };
      mesh.name = description.meshes[spec.mesh].name; mesh.extras = spec.extras || {};
      setParent(mesh, group);
    }
  }
  for (child of spec.children || []) setParent(modelNode(context, child), group);
  active.delete(index);
  return group;
}
