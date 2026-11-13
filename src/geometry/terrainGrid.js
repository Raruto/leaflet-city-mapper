/**
 * Create a unit tile grid; the vertex shader supplies the elevation.
 *
 * @param {number} divisions Grid subdivisions per side.
 *
 * @returns {Object} Position, normal, UV and index attributes.
 */
export function terrainGrid(divisions) {
  const vertices = (divisions + 1) ** 2;
  const positions = /* alloc */ new Float32Array(vertices * 3);
  const normals = /* alloc */ new Float32Array(vertices * 3);
  const uvs = /* alloc */ new Float32Array(vertices * 2);
  const indices = /* alloc */ new Uint16Array(divisions * divisions * 6);
  let row, column, a, b, c, d, vertex = 0, index = 0;
  for (row = 0; row <= divisions; row++) {
    for (column = 0; column <= divisions; column++) {
      positions[vertex * 3] = column / divisions;
      positions[vertex * 3 + 2] = row / divisions;
      normals[vertex * 3 + 1] = 1;
      uvs[vertex * 2] = column / divisions;
      uvs[vertex * 2 + 1] = row / divisions;
      vertex++;
      if (row < divisions && column < divisions) {
        a = row * (divisions + 1) + column;
        b = a + 1, c = a + divisions + 1, d = c + 1;
        indices[index++] = a; indices[index++] = c; indices[index++] = b;
        indices[index++] = b; indices[index++] = c; indices[index++] = d;
      }
    }
  }
  return /* alloc */ {
    position: /* alloc */ { size: 3, data: positions },
    normal: /* alloc */ { size: 3, data: normals },
    uv: /* alloc */ { size: 2, data: uvs },
    index: /* alloc */ { data: indices },
  };
}
