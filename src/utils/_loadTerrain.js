import { update } from './update.js';
import { setTerrainHeight } from './setTerrainHeight.js';

export async function _loadTerrain(backend) {
  if (backend._terrainLoading || !backend._map) return;
  backend._terrainLoading = true;
  backend._terrainReady = false;
  const controller = backend._terrainController = new AbortController();
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
    for (let x = northwest.x; x <= southeast.x; x++) {
      for (let y = northwest.y; y <= southeast.y; y++) tiles.push({ z: backend._terrainZoom, x, y });
    }
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(4, tiles.length) }, async () => {
      while (next < tiles.length) {
        controller.signal.throwIfAborted();
        const coords = tiles[next++];
        const result = await archive.getZxy(coords.z, coords.x, coords.y, controller.signal);
        if (!result || result.data.byteLength !== 256 * 256 * 4) {
          throw new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`);
        }
        backend._terrainTiles.set(`${coords.x}/${coords.y}`, new Float32Array(result.data));
      }
    }));
    const bridges = backend.options.bridges && await fetch(backend.options.bridges, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(`Bridges: HTTP ${response.status}`); return response.json(); });
    if (controller.signal.aborted || backend._map !== map) return;
    backend._terrainReady = true;
    backend._terrainOriginElevation = backend._getElevation(backend.location) ?? 0;
    for (const layer of Object.values(map._layers)) setTerrainHeight(layer);
    if (bridges) backend._addBridges(bridges);
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
