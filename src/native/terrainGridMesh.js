import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { coreWhite } from '../globals/coreWhite.js';
import { textureFor } from '../textures/nativeTextureFor.js';
import { terrainElevation } from '../terrain/terrainElevation.js';
import { localPosition } from '../projections/localPosition.js';
import { putNativeMesh } from './putNativeMesh.js';

export function terrainGridMesh(state, key, tile, request, opacity) {
  const texture = textureFor(state, key, tile.el);
  if (!texture) return;
  const { x, y, z } = tile.coords, divisions = 32;
  const northwest = localPosition(state, state.map.unproject(/* alloc */ [x * 256, y * 256], z));
  const southeast = localPosition(state, state.map.unproject(/* alloc */ [(x + 1) * 256, (y + 1) * 256], z));
  const vertices = /* alloc */ [], position = /* alloc */ [], uv = /* alloc */ [];
  const base = rootByLayer.get(state.backend).position[1];
  let row, col, u, v, elevation, a, b, c, d, index;
  for (row = 0; row <= divisions; row++) for (col = 0; col <= divisions; col++) {
    u = col / divisions; v = row / divisions;
    elevation = terrainElevation(/* alloc */ { x: (x + u) * 256, y: (y + v) * 256 }, request.tiles);
    if (!Number.isFinite(elevation)) throw /* alloc */ new Error(`Missing elevation sample in ${z}/${x}/${y}`);
    vertices.push(/* alloc */ [northwest[0] + (southeast[0] - northwest[0]) * u, elevation - base,
      northwest[2] + (southeast[2] - northwest[2]) * v, u, v]);
  }
  for (row = 0; row < divisions; row++) for (col = 0; col < divisions; col++) {
    a = row * (divisions + 1) + col; b = a + 1; c = a + divisions + 1; d = c + 1;
    for (index of /* alloc */ [a, c, b, b, c, d]) {
      position.push(vertices[index][0], vertices[index][1], vertices[index][2]);
      uv.push(vertices[index][3], vertices[index][4]);
    }
  }
  const mesh = putNativeMesh(state, key, position, coreWhite, opacity, texture, uv, true);
  mesh._terrainRequest = request;
  return mesh;
}
