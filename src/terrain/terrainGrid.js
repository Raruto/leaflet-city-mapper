/** Unit tile grid; the vertex shader supplies the elevation. */

export function terrainGrid(divisions) {
  const positions = [], normals = [], uvs = [], indices = [];
  for (let row = 0; row <= divisions; row++) {
    for (let column = 0; column <= divisions; column++) {
      positions.push(column / divisions, 0, row / divisions);
      normals.push(0, 1, 0);
      uvs.push(column / divisions, row / divisions);
      if (row < divisions && column < divisions) {
        const a = row * (divisions + 1) + column;
        const b = a + 1, c = a + divisions + 1, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  return {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    uv: { size: 2, data: new Float32Array(uvs) },
    index: { data: new Uint16Array(indices) },
  };
}
