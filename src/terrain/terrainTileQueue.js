import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { archiveNorthWest } from '../globals/archiveNorthWest.js';
import { archiveSouthEast } from '../globals/archiveSouthEast.js';
import { compareDistance } from '../utils/compareDistance.js';

export function terrainTileQueue(backend, header) {
  const scene = sceneByLayer.get(backend), map = backend._map;
  scene._terrainZoom = header.maxZoom;
  archiveNorthWest[0] = header.maxLat; archiveNorthWest[1] = header.minLon;
  const northwest = map.project(archiveNorthWest, scene._terrainZoom).divideBy(256).floor();
  archiveSouthEast[0] = header.minLat; archiveSouthEast[1] = header.maxLon;
  const southeast = map.project(archiveSouthEast, scene._terrainZoom).divideBy(256).floor();
  scene._terrainBounds = /* alloc */ new L.Bounds(northwest, southeast);
  const tiles = /* alloc */ [];
  const center = map.project(map.getCenter(), scene._terrainZoom).divideBy(256);
  let x, y;
  for (x = northwest.x; x <= southeast.x; x++) {
    for (y = northwest.y; y <= southeast.y; y++) {
      tiles.push(/* alloc */ { z: scene._terrainZoom, x, y, distance: Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) });
    }
  }
  tiles.sort(compareDistance);
  return tiles;
}
