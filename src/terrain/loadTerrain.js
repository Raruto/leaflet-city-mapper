import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { terrainArchiveByLayer } from '../weakmaps/terrainArchiveByLayer.js';
import { terrainControllerByLayer } from '../weakmaps/terrainControllerByLayer.js';
import { terrainLoadingByLayer } from '../weakmaps/terrainLoadingByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainSourceByLayer } from '../weakmaps/terrainSourceByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { createLayer } from '../scene/createLayer.js';

import { loadTerrainTiles } from './loadTerrainTiles.js';
import { readBridges } from './readBridges.js';
import { terrainTileQueue } from './terrainTileQueue.js';
import { applyTerrain } from './applyTerrain.js';

export async function loadTerrain(layer) {
  if (terrainLoadingByLayer.get(layer) || !layer._map) return;
  mutateWeakMap(terrainLoadingByLayer, layer, "=", true);
  mutateWeakMap(terrainReadyByLayer, layer, "=", false);
  const controller = mutateWeakMap(terrainControllerByLayer, layer, "=", /* alloc */ new AbortController());
  let i;
  try {
    if (!terrainSourceByLayer.get(layer)) throw /* alloc */ new Error('Terrain layer requires a PMTiles or COG elevation archive');
    const archive = mutateWeakMap(terrainArchiveByLayer, layer, "=", createLayer(/* alloc */ { source: /* alloc */ {
      type: layer.options.asset !== undefined || /\.tiff?(?:[?#]|$)/i.test(terrainSourceByLayer.get(layer)) ? 'cog' : 'pmtiles',
      url: terrainSourceByLayer.get(layer), archive: layer.options.archive, asset: layer.options.asset,
    } }));
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
    mutateWeakMap(terrainLoadingByLayer, layer, "=", false);
  }
}
