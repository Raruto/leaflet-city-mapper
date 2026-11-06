import { sceneByLayer } from '../globals/sceneByLayer.js';
import { createLayer } from '../scene/createLayer.js';

import { loadTerrainTiles } from './loadTerrainTiles.js';
import { readBridges } from './readBridges.js';
import { terrainTileQueue } from './terrainTileQueue.js';
import { applyTerrain } from './applyTerrain.js';

export async function loadTerrain(backend) {
  if (sceneByLayer.get(backend)._terrainLoading || !backend._map) return;
  sceneByLayer.get(backend)._terrainLoading = true;
  sceneByLayer.get(backend)._terrainReady = false;
  const controller = sceneByLayer.get(backend)._terrainController = /* alloc */ new AbortController();
  let i;
  try {
    if (!sceneByLayer.get(backend).terrainSource) throw /* alloc */ new Error('Terrain layer requires a PMTiles or COG elevation archive');
    const archive = sceneByLayer.get(backend)._terrainArchive = createLayer(/* alloc */ { source: /* alloc */ {
      type: backend.options.asset !== undefined || /\.tiff?(?:[?#]|$)/i.test(sceneByLayer.get(backend).terrainSource) ? 'cog' : 'pmtiles',
      url: sceneByLayer.get(backend).terrainSource, archive: backend.options.archive, asset: backend.options.asset,
    } });
    await sceneByLayer.get(archive).ready;
    const header = sceneByLayer.get(archive).header;
    if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
      throw /* alloc */ new Error('Expected a single-zoom Float32 terrain archive');
    }
    const map = backend._map;
    const tiles = terrainTileQueue(backend, header);
    const state = /* alloc */ { backend, archive, controller, tiles, next: 0 };
    const workers = /* alloc */ [];
    for (i = 0; i < Math.min(4, tiles.length); i++) workers.push(loadTerrainTiles(state));
    await Promise.all(workers);
    const bridges = backend.options.bridges && await fetch(backend.options.bridges, /* alloc */ { signal: controller.signal })
      .then(readBridges);
    if (controller.signal.aborted || backend._map !== map) return;
    applyTerrain(backend, map, bridges);
    return true;
  } catch (error) {
    if (!controller.signal.aborted) backend.fire('error', /* alloc */ { error });
    return false;
  } finally {
    sceneByLayer.get(backend)._terrainLoading = false;
  }
}
