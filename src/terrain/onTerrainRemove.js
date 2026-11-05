import { destroyTexture } from '../rendering/textures/destroyTexture.js';
import { conformModelToTerrain } from '../geometry/terrain/conformModelToTerrain.js';
import { disposeMesh } from '../rendering/meshes/disposeMesh.js';
import { setRasterTerrain } from '../pmtiles/raster/setRasterTerrain.js';
import { removeRasterTile } from '../pmtiles/raster/removeRasterTile.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { onRemove3DLayer } from '../scene/lifecycle/onRemove3DLayer.js';
import { clearLayerTerrain } from './clearLayerTerrain.js';

export function onTerrainRemove(layer, map) {
  layer._terrainController?.abort();
  layer._terrainLoading = false;
  layer._terrainReady = false;
  map.eachLayer(clearLayerTerrain);
  for (const tile of layer._rasterTiles.keys()) removeRasterTile(layer, tile);
  if (map._terrain3D === layer) delete map._terrain3D;
  for (const l of Object.values(map._layers)) {
    conformModelToTerrain(l, null);
    setTerrainHeight(l);
  }

  map.fire('terrainchange');
  layer._terrainTiles.clear();
  layer._terrainOriginElevation = 0;
  layer._terrainPromise = null;
  if (layer._rasterProgram) {
    layer._rasterProgram.pipelineCache.clear();
  }
  layer._rasterProgram = null;
  if (layer._dem) destroyTexture(layer, layer._dem.texture);
  layer._dem = null;
  for (const grid of layer._terrainGrids?.values() || []) {
    for (const attribute of Object.values(grid)) destroyTexture(layer, attribute.buffer);
  }
  layer._terrainGrids = null;
  layer._bridges = null;
  disposeMesh(layer, layer._bridgeMesh);
  layer._bridgeMesh = null;
  onRemove3DLayer(layer, map);
}
