import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';

import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';
import { roofTiles } from '../globals/roofTiles.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';
import { roofMin } from '../globals/roofMin.js';
import { roofSize } from '../globals/roofSize.js';


import { ensureRoofBlit } from './ensureRoofBlit.js';
import { composeRoofAtlas } from './composeRoofAtlas.js';
import { collectRoofTiles } from './collectRoofTiles.js';
import { resizeRoofTexture } from './resizeRoofTexture.js';

export function rebuildRoofAtlas(layer, rasters, signature, now) {
  const map = layer._map, renderer = rendererByLayer.get(layer);
  const tiles = roofTiles;
  tiles.length = 0;
  let zoom = collectRoofTiles(rasters, tiles);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let coords, tileSize;
  if (!tiles.length) zoom = map.getZoom();
  for ({ tile: { coords } } of tiles) {
    tileSize = TILE_SIZE * map.getZoomScale(zoom, coords.z);
    minX = Math.min(minX, coords.x * tileSize); minY = Math.min(minY, coords.y * tileSize);
    maxX = Math.max(maxX, (coords.x + 1) * tileSize); maxY = Math.max(maxY, (coords.y + 1) * tileSize);
  }
  const origin = map.project(sceneOriginByLayer.get(layer), zoom);
  const min = roofMin, size = roofSize;
  min.x = tiles.length ? minX : origin.x; min.y = tiles.length ? minY : origin.y;
  size.x = tiles.length ? maxX - minX : 1; size.y = tiles.length ? maxY - minY : 1;
  // ponytail: cap at 4096 px; virtual textures if wide views need native detail.
  const scale = Math.min(1, 4096 / Math.max(size.x, size.y));
  const width = Math.max(1, Math.ceil(size.x * scale)), height = Math.max(1, Math.ceil(size.y * scale));
  const pixels = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
  const roof = /* alloc */ {
    matrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    texture: roofRasterByLayer.get(layer)?.texture,
  };
  roofRasterByLayer.set(layer, roof);
  roof.signature = signature; roof.updatedAt = now;
  roof.matrix[0] = pixels / size.x; roof.matrix[10] = pixels / size.y;
  roof.matrix[12] = (origin.x - min.x) / size.x; roof.matrix[14] = (origin.y - min.y) / size.y;
  resizeRoofTexture(layer, roof, width, height);
  // Compose the atlas on the GPU: re-uploading a large canvas stalls Firefox for hundreds of ms.
  ensureRoofBlit(renderer);
  try {
    composeRoofAtlas(layer, tiles, zoom, min, size, width, height);
  } finally {
    tiles.length = 0;
  }
}
