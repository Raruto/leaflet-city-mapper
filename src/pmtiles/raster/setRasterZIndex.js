import { update } from '../../scene/lifecycle/update.js';

export function setRasterZIndex(backend, zIndex) {
  for (const tile of backend._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.renderOrder = zIndex;
    const terrainMesh = backend._terrain3D?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.renderOrder = zIndex;
  }
  update(backend);
}
