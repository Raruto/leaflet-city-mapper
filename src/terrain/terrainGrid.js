/** Unit tile grid; the vertex shader supplies the elevation. */

export function terrainGrid(divisions) {
  const vertices = (divisions + 1) ** 2;
  const positions = /* allocation: required -- Returned grid owns its position upload buffer. */ new Float32Array(vertices * 3);
  const normals = /* allocation: required -- Returned grid owns its normal upload buffer. */ new Float32Array(vertices * 3);
  const uvs = /* allocation: required -- Returned grid owns its texture-coordinate upload buffer. */ new Float32Array(vertices * 2);
  const indices = /* allocation: required -- Returned grid owns its index upload buffer. */ new Uint16Array(divisions * divisions * 6);
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
  return /* allocation: required -- Each cached terrain grid owns its attribute table. */ {
    position: /* allocation: required -- Position metadata retains this grid's GPU buffer. */ { size: 3, data: positions },
    normal: /* allocation: required -- Normal metadata retains this grid's GPU buffer. */ { size: 3, data: normals },
    uv: /* allocation: required -- UV metadata retains this grid's GPU buffer. */ { size: 2, data: uvs },
    index: /* allocation: required -- Index metadata retains this grid's GPU buffer. */ { data: indices },
  };
}
