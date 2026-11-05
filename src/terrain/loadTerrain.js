import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { archiveNorthWest } from '../globals/archiveNorthWest.js';
import { archiveSouthEast } from '../globals/archiveSouthEast.js';
import { createLayer } from '../scene/createLayer.js';

import { addBridges } from '../geometry/addBridges.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { getElevation } from './getElevation.js';
import { setTerrainHeight } from './setTerrainHeight.js';
import { update } from '../scene/update.js';
import { compareDistance } from '../utils/compareDistance.js';
import { loadTerrainTiles } from './loadTerrainTiles.js';
import { readBridges } from './readBridges.js';

export async function loadTerrain(backend) {
  if (sceneByLayer.get(backend)._terrainLoading || !backend._map) return;
  sceneByLayer.get(backend)._terrainLoading = true;
  sceneByLayer.get(backend)._terrainReady = false;
  const controller = sceneByLayer.get(backend)._terrainController = /* alloc */ new AbortController();
  let x, y, i, layer;
  try {
    if (!sceneByLayer.get(backend).terrainSource) throw /* alloc */ new Error('Terrain layer requires a PMTiles elevation archive');
    const archive = sceneByLayer.get(backend)._terrainArchive = createLayer(/* alloc */ { source: /* alloc */ {
      type: 'pmtiles', url: sceneByLayer.get(backend).terrainSource, archive: backend.options.archive,
    } });
    await sceneByLayer.get(archive).ready;
    const header = sceneByLayer.get(archive).header;
    if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
      throw /* alloc */ new Error('Expected a single-zoom Float32 PMTiles terrain archive');
    }
    sceneByLayer.get(backend)._terrainZoom = header.maxZoom;
    const map = backend._map;
    const northWestLocation = archiveNorthWest;
    northWestLocation[0] = header.maxLat; northWestLocation[1] = header.minLon;
    const northwest = map.project(northWestLocation, sceneByLayer.get(backend)._terrainZoom).divideBy(256).floor();
    const southEastLocation = archiveSouthEast;
    southEastLocation[0] = header.minLat; southEastLocation[1] = header.maxLon;
    const southeast = map.project(southEastLocation, sceneByLayer.get(backend)._terrainZoom).divideBy(256).floor();
    sceneByLayer.get(backend)._terrainBounds = /* alloc */ new L.Bounds(northwest, southeast);
    const tiles = /* alloc */ [];
    const center = map.project(map.getCenter(), sceneByLayer.get(backend)._terrainZoom).divideBy(256);
    for (x = northwest.x; x <= southeast.x; x++) {
      for (y = northwest.y; y <= southeast.y; y++) {
        tiles.push(/* alloc */ { z: sceneByLayer.get(backend)._terrainZoom, x, y, distance: Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) });
      }
    }
    tiles.sort(compareDistance);
    const state = /* alloc */ { backend, archive, controller, tiles, next: 0 };
    const workers = /* alloc */ [];
    for (i = 0; i < Math.min(4, tiles.length); i++) workers.push(loadTerrainTiles(state));
    await Promise.all(workers);
    const bridges = backend.options.bridges && await fetch(backend.options.bridges, /* alloc */ { signal: controller.signal })
      .then(readBridges);
    if (controller.signal.aborted || backend._map !== map) return;
    sceneByLayer.get(backend)._terrainReady = true;
    sceneByLayer.get(backend)._terrainOriginElevation = getElevation(backend, sceneByLayer.get(backend).location) ?? 0;
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
    if (!controller.signal.aborted) backend.fire('error', /* alloc */ { error });
    return false;
  } finally {
    sceneByLayer.get(backend)._terrainLoading = false;
  }
}
