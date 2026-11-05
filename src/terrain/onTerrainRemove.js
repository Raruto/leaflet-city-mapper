import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { removeRasterTile } from '../raster/removeRasterTile.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';
import { clearLayerTerrain } from './clearLayerTerrain.js';

export function onTerrainRemove(layer, map) {
  pluginState(layer)._terrainController?.abort();
  pluginState(layer)._terrainLoading = false;
  pluginState(layer)._terrainReady = false;
  map.eachLayer(clearLayerTerrain);
  let tile, l, grid, attribute;
  for (tile of pluginState(layer)._rasterTiles.keys()) removeRasterTile(layer, tile);
  if (pluginState(map)._terrain3D === layer) delete pluginState(map)._terrain3D;
  for (l of Object.values(map._layers)) {
    conformModelToTerrain(l, null);
    setTerrainHeight(l);
  }

  map.fire('terrainchange');
  pluginState(layer)._terrainTiles.clear();
  pluginState(layer)._terrainOriginElevation = 0;
  pluginState(layer)._terrainPromise = null;
  if (pluginState(layer)._rasterProgram) {
    pluginState(layer)._rasterProgram.pipelineCache.clear();
  }
  pluginState(layer)._rasterProgram = null;
  if (pluginState(layer)._dem) destroyTexture(layer, pluginState(layer)._dem.texture);
  pluginState(layer)._dem = null;
  for (grid of pluginState(layer)._terrainGrids?.values() || sharedState.allocationRenderEmpty) {
    for (attribute of Object.values(grid)) destroyTexture(layer, attribute.buffer);
  }
  pluginState(layer)._terrainGrids = null;
  pluginState(layer)._bridges = null;
  disposeMesh(layer, pluginState(layer)._bridgeMesh);
  pluginState(layer)._bridgeMesh = null;
  onRemove3DLayer(layer, map);
}
import { state as sharedState } from '../state.js';
