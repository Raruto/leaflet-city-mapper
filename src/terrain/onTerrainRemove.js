import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { renderEmpty } from '../globals/renderEmpty.js';

import { destroyTexture } from '../rendering/destroyTexture.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { removeRasterTile } from '../raster/removeRasterTile.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';
import { clearLayerTerrain } from './clearLayerTerrain.js';

export function onTerrainRemove(layer, map) {
  sceneByLayer.get(layer)._terrainController?.abort();
  sceneByLayer.get(layer)._terrainLoading = false;
  sceneByLayer.get(layer)._terrainReady = false;
  map.eachLayer(clearLayerTerrain);
  let tile, l, grid, attribute;
  for (tile of sceneByLayer.get(layer)._rasterTiles.keys()) removeRasterTile(layer, tile);
  if (cameraByMap.get(map)._terrain3D === layer) delete cameraByMap.get(map)._terrain3D;
  for (l of Object.values(map._layers)) {
    conformModelToTerrain(l, null);
    setTerrainHeight(l);
  }

  map.fire('terrainchange');
  sceneByLayer.get(layer)._terrainTiles.clear();
  sceneByLayer.get(layer)._terrainOriginElevation = 0;
  sceneByLayer.get(layer)._terrainPromise = null;
  if (sceneByLayer.get(layer)._rasterProgram) {
    sceneByLayer.get(layer)._rasterProgram.pipelineCache.clear();
  }
  sceneByLayer.get(layer)._rasterProgram = null;
  if (sceneByLayer.get(layer)._dem) destroyTexture(layer, sceneByLayer.get(layer)._dem.texture);
  sceneByLayer.get(layer)._dem = null;
  for (grid of sceneByLayer.get(layer)._terrainGrids?.values() || renderEmpty) {
    for (attribute of Object.values(grid)) destroyTexture(layer, attribute.buffer);
  }
  sceneByLayer.get(layer)._terrainGrids = null;
  sceneByLayer.get(layer)._bridges = null;
  disposeMesh(layer, sceneByLayer.get(layer)._bridgeMesh);
  sceneByLayer.get(layer)._bridgeMesh = null;
  onRemove3DLayer(layer, map);
}
