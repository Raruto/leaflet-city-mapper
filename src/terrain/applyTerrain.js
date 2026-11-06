import { sceneByLayer } from '../globals/sceneByLayer.js';
import { addBridges } from '../geometry/addBridges.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { getElevation } from './getElevation.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { update } from '../scene/update.js';

export function applyTerrain(backend, map, bridges) {
  const scene = sceneByLayer.get(backend);
  scene._terrainReady = true;
  scene._terrainOriginElevation = getElevation(backend, scene.location) ?? 0;
  let layer;
  for (layer of Object.values(map._layers)) {
    setTerrainHeight(layer);
    conformModelToTerrain(layer, backend);
  }
  if (bridges) addBridges(backend, bridges);
  map.fire('terrainchange');
  update(backend);
  backend.fire('terrainready');
}
