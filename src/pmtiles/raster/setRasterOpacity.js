import { update } from '../../scene/lifecycle/update.js';

export function setRasterOpacity(backend, opacity) {
  for (const tile of backend._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    const terrainMesh = backend._terrain3D?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(backend);
}
