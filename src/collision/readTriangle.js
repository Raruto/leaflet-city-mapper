import { vertexCount } from './vertexCount.js';

/**
 * Read an indexed or non-indexed triangle into caller-owned vectors, applying any instance offset.
 *
 * @param {Object} mesh Mesh containing geometry attributes.
 * @param {number} i First index or vertex offset, including instance offset.
 * @param {number[]} a Output first vertex.
 * @param {number[]} b Output second vertex.
 * @param {number[]} c Output third vertex.
 */
export function readTriangle(mesh, i, a, b, c) {
  const { position, index, instanceOffset } = mesh.geometry.attributes;
  const size = position.size ?? 3;
  const vertices = vertexCount(position, index);
  const vertex = instanceOffset ? i % vertices : i;
  const offset = instanceOffset ? Math.floor(i / vertices) * instanceOffset.size : 0;
  const x = instanceOffset?.data[offset] ?? 0;
  const y = instanceOffset?.data[offset + 1] ?? 0;
  const z = instanceOffset?.data[offset + 2] ?? 0;
  const ai = (index ? index.data[vertex] : vertex) * size;
  const bi = (index ? index.data[vertex + 1] : vertex + 1) * size;
  const ci = (index ? index.data[vertex + 2] : vertex + 2) * size;
  a[0] = position.data[ai]; a[1] = position.data[ai + 1]; a[2] = position.data[ai + 2];
  b[0] = position.data[bi]; b[1] = position.data[bi + 1]; b[2] = position.data[bi + 2];
  c[0] = position.data[ci]; c[1] = position.data[ci + 1]; c[2] = position.data[ci + 2];
  if (instanceOffset) {
    a[0] = Math.fround(a[0] + x); a[1] = Math.fround(a[1] + y); a[2] = Math.fround(a[2] + z);
    b[0] = Math.fround(b[0] + x); b[1] = Math.fround(b[1] + y); b[2] = Math.fround(b[2] + z);
    c[0] = Math.fround(c[0] + x); c[1] = Math.fround(c[1] + y); c[2] = Math.fround(c[2] + z);
  }
}
