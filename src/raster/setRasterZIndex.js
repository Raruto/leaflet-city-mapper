import { sceneByLayer } from '../globals/sceneByLayer.js';


import { update } from '../scene/update.js';

export function setRasterZIndex(backend, zIndex) {
  let tile, terrainMesh;
  for (tile of sceneByLayer.get(backend)._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.renderOrder = zIndex;
    terrainMesh = sceneByLayer.get(sceneByLayer.get(backend)._terrain3D)?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.renderOrder = zIndex;
  }
  update(backend);
}
