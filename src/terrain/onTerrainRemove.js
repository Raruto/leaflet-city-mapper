import { bridgeMeshByLayer } from '../weakmaps/bridgeMeshByLayer.js';
import { bridgesByLayer } from '../weakmaps/bridgesByLayer.js';
import { demByLayer } from '../weakmaps/demByLayer.js';
import { rasterProgramByLayer } from '../weakmaps/rasterProgramByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrainControllerByLayer } from '../weakmaps/terrainControllerByLayer.js';
import { terrainGridsByLayer } from '../weakmaps/terrainGridsByLayer.js';
import { terrainLoadingByLayer } from '../weakmaps/terrainLoadingByLayer.js';
import { terrainOriginElevationByLayer } from '../weakmaps/terrainOriginElevationByLayer.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { renderEmpty } from '../globals/renderEmpty.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { removeRasterTile } from '../raster/removeRasterTile.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';
import { clearLayerTerrain } from './clearLayerTerrain.js';

/**
 * Detach terrain from a map and release associated requests and rendering resources.
 *
 * @param {L.Layer} layer Terrain layer to remove.
 * @param {L.Map} map Map containing the terrain.
 */
export function onTerrainRemove(layer, map) {
  const stream = streamTerrainByMap.get(map);
  if (stream?.layer === layer) {
    streamTerrainByMap.delete(map);
    stream.terrainController.abort();
    stream.terrainCache.clear();
    map.fire('terrainchange');
    onRemove3DLayer(layer, map);
    return;
  }
  terrainControllerByLayer.get(layer)?.abort();
  terrainLoadingByLayer.set(layer, false);
  terrainReadyByLayer.set(layer, false);
  map.eachLayer(clearLayerTerrain);
  let tile, l, grid, attribute;
  for (tile of rasterTilesByLayer.get(layer).keys()) removeRasterTile(layer, tile);
  if (terrain3DByMap.get(map) === layer) terrain3DByMap.delete(map);
  for (l of Object.values(map._layers)) {
    conformModelToTerrain(l, null);
    setTerrainHeight(l);
  }

  map.fire('terrainchange');
  terrainTilesByLayer.get(layer).clear();
  terrainOriginElevationByLayer.set(layer, 0);
  terrainPromiseByLayer.set(layer, null);
  if (rasterProgramByLayer.get(layer)) {
    rasterProgramByLayer.get(layer).pipelineCache.clear();
  }
  rasterProgramByLayer.set(layer, null);
  if (demByLayer.get(layer)) destroyTexture(layer, demByLayer.get(layer).texture);
  demByLayer.set(layer, null);
  for (grid of terrainGridsByLayer.get(layer)?.values() || renderEmpty) {
    for (attribute of Object.values(grid)) destroyTexture(layer, attribute.buffer);
  }
  terrainGridsByLayer.set(layer, null);
  bridgesByLayer.set(layer, null);
  disposeMesh(layer, bridgeMeshByLayer.get(layer));
  bridgeMeshByLayer.set(layer, null);
  onRemove3DLayer(layer, map);
}
