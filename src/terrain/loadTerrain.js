import { addBridges } from '../geometry/addBridges.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { getElevation } from './getElevation.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { update } from '../scene/update.js';
import { compareDistance } from '../utils/compareDistance.js';
import { loadTerrainTiles } from './loadTerrainTiles.js';
import { readBridges } from './readBridges.js';


export async function loadTerrain(backend) {
  if (backend._terrainLoading || !backend._map) return;
  backend._terrainLoading = true;
  backend._terrainReady = false;
  const controller = backend._terrainController = new AbortController();
  let x, y, i, layer;
  try {
    if (!backend.terrainSource) throw new Error('Terrain layer requires a PMTiles elevation archive');
    const archive = backend._terrainArchive = new L.Layer({ source: { type: 'pmtiles', url: backend.terrainSource } });
    await archive.ready;
    const header = archive.header;
    if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
      throw new Error('Expected a single-zoom Float32 PMTiles terrain archive');
    }
    backend._terrainZoom = header.maxZoom;
    const map = backend._map;
    const northwest = map.project([header.maxLat, header.minLon], backend._terrainZoom).divideBy(256).floor();
    const southeast = map.project([header.minLat, header.maxLon], backend._terrainZoom).divideBy(256).floor();
    backend._terrainBounds = new L.Bounds(northwest, southeast);
    const tiles = [];
    const center = map.project(map.getCenter(), backend._terrainZoom).divideBy(256);
    for (x = northwest.x; x <= southeast.x; x++) {
      for (y = northwest.y; y <= southeast.y; y++) {
        tiles.push({ z: backend._terrainZoom, x, y, distance: Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) });
      }
    }
    tiles.sort(compareDistance);
    const state = { backend, archive, controller, tiles, next: 0 };
    const workers = [];
    for (i = 0; i < Math.min(4, tiles.length); i++) workers.push(loadTerrainTiles(state));
    await Promise.all(workers);
    const bridges = backend.options.bridges && await fetch(backend.options.bridges, { signal: controller.signal })
      .then(readBridges);
    if (controller.signal.aborted || backend._map !== map) return;
    backend._terrainReady = true;
    backend._terrainOriginElevation = getElevation(backend, backend.location) ?? 0;
    for (layer of Object.values(map._layers)) {
      setTerrainHeight(layer);
      conformModelToTerrain(layer, backend);
    }

    if (bridges) addBridges(backend, bridges);
    map.fire('terrainchange');
    update(backend);
    backend.fire('terrainready');
    return true;
  } catch (error) {
    if (!controller.signal.aborted) backend.fire('error', { error });
    return false;
  } finally {
    backend._terrainLoading = false;
  }
}
