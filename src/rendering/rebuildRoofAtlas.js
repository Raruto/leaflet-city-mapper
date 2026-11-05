import { ensureRoofBlit } from './ensureRoofBlit.js';
import { composeRoofAtlas } from './composeRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';
import { getRasterTileSize } from '../raster/getRasterTileSize.js';

export function rebuildRoofAtlas(backend, rasters, signature, now) {
  const map = backend._map, renderer = backend.renderer;
  const tiles = [];
  let zoom = -Infinity;
  let layer, tile, coords, size2;
  for (layer of rasters) for (tile of layer._rasterTiles.values()) {
    if (tile.done && !tile.request.signal.aborted && tile.image) {
      tiles.push({ tile, layer });
      zoom = Math.max(zoom, tile.coords.z);
    }
  }
  if (!tiles.length) zoom = map.getZoom();
  const bounds = new L.Bounds();
  for ({ tile: { coords }, layer } of tiles) {
    size2 = getRasterTileSize().multiplyBy(map.getZoomScale(zoom, coords.z));
    bounds.extend(new L.Point(coords.x, coords.y).scaleBy(size2));
    bounds.extend(new L.Point(coords.x + 1, coords.y + 1).scaleBy(size2));
  }
  const min = bounds.min || map.project(backend._sceneOrigin, zoom);
  const size = bounds.isValid() ? bounds.getSize() : new L.Point(1, 1);
  // ponytail: cap at 4096 px; virtual textures if wide views need native detail.
  const limit = 4096;
  const scale = Math.min(1, limit / Math.max(size.x, size.y));
  const width = Math.max(1, Math.ceil(size.x * scale));
  const height = Math.max(1, Math.ceil(size.y * scale));
  const origin = map.project(backend._sceneOrigin, zoom);
  const pixels = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
  const matrix = new DOMMatrix();
  matrix.m11 = pixels / size.x; matrix.m33 = pixels / size.y;
  matrix.m41 = (origin.x - min.x) / size.x; matrix.m43 = (origin.y - min.y) / size.y;
  const texture = backend._roofRaster?.texture;
  if (texture && (texture.width !== width || texture.height !== height)) {
    destroyTexture(backend, texture.texture);
    texture.texture = renderer.device.createTexture({
      size: [width, height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    texture.width = width;
    texture.height = height;
  }
  backend._roofRaster = {
    signature, updatedAt: now, matrix: Array.from(matrix.toFloat64Array()),
    texture: texture || {
      device: renderer.device,
      texture: renderer.device.createTexture({
        size: [width, height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: renderer.device.createSampler({
        addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
      }),
      samplerOptions: { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
      image: null, width, height,
      format: 'rgba8unorm', srgb: false, flipY: false, uploaded: null,
    },
  };
  // Compose the atlas on the GPU: re-uploading a large canvas stalls Firefox for hundreds of ms.
  ensureRoofBlit(renderer);
  composeRoofAtlas(backend, tiles, zoom, min, size, width, height);
}
