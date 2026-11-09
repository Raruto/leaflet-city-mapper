import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { terrainArchiveByLayer } from '../weakmaps/terrainArchiveByLayer.js';
import { terrainControllerByLayer } from '../weakmaps/terrainControllerByLayer.js';
import { terrainLoadingByLayer } from '../weakmaps/terrainLoadingByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainSourceByLayer } from '../weakmaps/terrainSourceByLayer.js';
import { workerMapByLayer } from '../weakmaps/workerMapByLayer.js';

import { createLayer } from '../scene/createLayer.js';

import { loadTerrainTiles } from './loadTerrainTiles.js';
import { readBridges } from './readBridges.js';
import { terrainTileQueue } from './terrainTileQueue.js';
import { applyTerrain } from './applyTerrain.js';

export async function loadTerrain(layer) {
  if (terrainLoadingByLayer.get(layer) || !layer._map) return;
  terrainLoadingByLayer.set(layer, true);
  terrainReadyByLayer.set(layer, false);
  const controller = /* alloc */ new AbortController();
  terrainControllerByLayer.set(layer, controller);
  let i;
  try {
    if (!terrainSourceByLayer.get(layer)) throw /* alloc */ new Error('Terrain layer requires a PMTiles or COG elevation archive');
    const archive = createLayer(/* alloc */ { source: /* alloc */ {
      type: 'raster',
      url: terrainSourceByLayer.get(layer), archive: layer.options.archive, asset: layer.options.asset,
      workerUrl: layer.options.workerUrl,
    } });
    workerMapByLayer.set(archive, layer._map);
    terrainArchiveByLayer.set(layer, archive);
    await readyByLayer.get(archive);
    const header = headerByLayer.get(archive);
    if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
      throw /* alloc */ new Error('Expected a single-zoom Float32 terrain archive');
    }
    const map = layer._map;
    const tiles = terrainTileQueue(layer, header);
    const state = /* alloc */ { backend: layer, archive, controller, tiles, next: 0 };
    const workers = /* alloc */ [];
    for (i = 0; i < Math.min(4, tiles.length); i++) workers.push(loadTerrainTiles(state));
    await Promise.all(workers);
    const bridges = layer.options.bridges && await fetch(layer.options.bridges, /* alloc */ { signal: controller.signal })
      .then(readBridges);
    if (controller.signal.aborted || layer._map !== map) return;
    applyTerrain(layer, map, bridges);
    return true;
  } catch (error) {
    if (!controller.signal.aborted) layer.fire('error', /* alloc */ { error });
    return false;
  } finally {
    terrainLoadingByLayer.set(layer, false);
  }
}
