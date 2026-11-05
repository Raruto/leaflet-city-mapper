import { sceneByLayer } from '../globals/sceneByLayer.js';


import { update } from '../scene/update.js';

export function setRasterOpacity(backend, opacity) {
  let tile, terrainMesh;
  for (tile of sceneByLayer.get(backend)._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    terrainMesh = sceneByLayer.get(sceneByLayer.get(backend)._terrain3D)?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(backend);
}
