import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { ensureRoofBlit } from './ensureRoofBlit.js';
import { composeRoofAtlas } from './composeRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

export function rebuildRoofAtlas(backend, rasters, signature, now) {
  const gpuCreateTexture1 = sharedState.allocationRenderRebuildRoofAtlasCreateTexture1;
  const gpuCreateSampler3 = sharedState.allocationRenderRebuildRoofAtlasCreateSampler3;
  const map = backend._map, renderer = pluginState(backend).renderer;
  const tiles = sharedState.allocationRenderRoofTiles;
  tiles.length = 0;
  let zoom = -Infinity, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let layer, tile, coords, tileSize;
  for (layer of rasters) for (tile of pluginState(layer)._rasterTiles.values()) {
    if (tile.done && !tile.request.signal.aborted && tile.image) {
      tile._roofEntry ||= /* allocation: required -- Each raster tile retains its atlas-sort entry until the tile is released. */ { tile, layer };
      tiles.push(tile._roofEntry);
      zoom = Math.max(zoom, tile.coords.z);
    }
  }
  if (!tiles.length) zoom = map.getZoom();
  for ({ tile: { coords } } of tiles) {
    tileSize = sharedState.TILE_SIZE * map.getZoomScale(zoom, coords.z);
    minX = Math.min(minX, coords.x * tileSize); minY = Math.min(minY, coords.y * tileSize);
    maxX = Math.max(maxX, (coords.x + 1) * tileSize); maxY = Math.max(maxY, (coords.y + 1) * tileSize);
  }
  const origin = map.project(pluginState(backend)._sceneOrigin, zoom);
  const min = sharedState.allocationRenderRoofMin, size = sharedState.allocationRenderRoofSize;
  min.x = tiles.length ? minX : origin.x; min.y = tiles.length ? minY : origin.y;
  size.x = tiles.length ? maxX - minX : 1; size.y = tiles.length ? maxY - minY : 1;
  // ponytail: cap at 4096 px; virtual textures if wide views need native detail.
  const scale = Math.min(1, 4096 / Math.max(size.x, size.y));
  const width = Math.max(1, Math.ceil(size.x * scale)), height = Math.max(1, Math.ceil(size.y * scale));
  const pixels = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(pluginState(backend)._sceneOrigin.lat * Math.PI / 180));
  const roof = /* allocation: required -- Observers may retain the prior atlas metadata while this backend publishes a replacement. */ {
    matrix: /* allocation: required -- Each published atlas snapshot owns its projection matrix. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    texture: pluginState(backend)._roofRaster?.texture,
  };
  pluginState(backend)._roofRaster = roof;
  roof.signature = signature; roof.updatedAt = now;
  roof.matrix[0] = pixels / size.x; roof.matrix[10] = pixels / size.y;
  roof.matrix[12] = (origin.x - min.x) / size.x; roof.matrix[14] = (origin.y - min.y) / size.y;
  const descriptor = gpuCreateTexture1;
  descriptor.size[0] = width; descriptor.size[1] = height;
  descriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
  if (roof.texture && (roof.texture.width !== width || roof.texture.height !== height)) {
    destroyTexture(backend, roof.texture.texture);
    roof.texture.texture = renderer.device.createTexture(descriptor);
    roof.texture.width = width; roof.texture.height = height;
  }
  roof.texture ||= /* allocation: required -- The backend owns this atlas GPU texture and sampler until disposal. */ {
    device: renderer.device,
    texture: renderer.device.createTexture(descriptor),
    sampler: renderer.device.createSampler(gpuCreateSampler3),
    samplerOptions: /* allocation: required -- The retained atlas texture owns its sampler options for device restoration. */ { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
    image: null, width, height,
    format: 'rgba8unorm', srgb: false, flipY: false, uploaded: null,
  };
  // Compose the atlas on the GPU: re-uploading a large canvas stalls Firefox for hundreds of ms.
  ensureRoofBlit(renderer);
  try {
    composeRoofAtlas(backend, tiles, zoom, min, size, width, height);
  } finally {
    tiles.length = 0;
  }
}
