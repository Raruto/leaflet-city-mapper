import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { terrainOriginElevationByLayer } from '../weakmaps/terrainOriginElevationByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';

import { addBridges } from '../geometry/addBridges.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { getElevation } from './getElevation.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { update } from '../scene/scheduleSceneUpdate.js';

export function applyTerrain(layer, map, bridges) {

  terrainReadyByLayer.set(layer, true);
  terrainOriginElevationByLayer.set(layer, getElevation(layer, locationByLayer.get(layer)) ?? 0);
  let mapLayer;
  for (mapLayer of Object.values(map._layers)) {
    setTerrainHeight(mapLayer);
    conformModelToTerrain(mapLayer, layer);
  }
  if (bridges) addBridges(layer, bridges);
  map.fire('terrainchange');
  update(layer);
  layer.fire('terrainready');
}
