import { destroyTexture } from './destroyTexture.js';
import { disposeMesh } from './disposeMesh.js';
import { removeProgram } from './removeProgram.js';

export function onTerrainRemove(backend, map) {
  backend._terrainController?.abort();
  backend._terrainLoading = false;
  backend._terrainReady = false;
  map.eachLayer(layer => layer._setTerrain3D?.(null));
  for (const tile of backend._rasterTiles.keys()) backend.removeRasterTile(tile);
  if (map._terrain3D === backend) delete map._terrain3D;
  for (const layer of Object.values(map._layers)) layer._setTerrainHeight?.();
  map.fire('terrainchange');
  backend._terrainTiles.clear();
  backend._terrainOriginElevation = 0;
  backend._terrainPromise = null;
  if (backend._rasterProgram) removeProgram(backend._rasterProgram);
  backend._rasterProgram = null;
  if (backend._dem) destroyTexture(backend, backend._dem.texture);
  backend._dem = null;
  for (const grid of backend._terrainGrids?.values() || []) {
    for (const attribute of Object.values(grid)) destroyTexture(backend, attribute.buffer);
  }
  backend._terrainGrids = null;
  backend._bridges = null;
  disposeMesh(backend, backend._bridgeMesh);
  backend._bridgeMesh = null;
  L.Layer.types['3d'].prototype.onRemove.call(backend, map);
}
