import { createProgram } from './createProgram.js';
import { destroyTexture } from './destroyTexture.js';
import { terrainAtlas } from './terrainAtlas.js';
import { terrainGrid } from './terrainGrid.js';
import { setParent } from './setParent.js';
import { update } from './update.js';

export async function addRasterTile(backend, layer, coords, tile) {
  const ready = await backend._terrainPromise;
  if (!ready || !backend._map || backend._map._terrain3D !== backend || layer._terrain3D !== backend ||
    tile.request.signal.aborted || !layer._rasterTiles.has(`${coords.z}/${coords.x}/${coords.y}`) ||
    backend._rasterTiles.has(tile)) {
    return;
  }
  // Match DEM pixel spacing, capped at 64 subdivisions per tile.
  const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - backend._terrainZoom)));
  const map = backend._map, crs = map.options.crs;
  const origin = crs.project(backend.location), metres = Math.cos(backend.location.lat * Math.PI / 180);
  // Tile pixels map linearly to projected metres: one scaled unit grid per tile, elevation in the vertex shader.
  const scale = crs.scale(coords.z), terrainScale = 2 ** (backend._terrainZoom - coords.z);
  const corner = crs.transformation.untransform(new L.Point(coords.x * 256, coords.y * 256), scale);
  const opposite = crs.transformation.untransform(new L.Point((coords.x + 1) * 256, (coords.y + 1) * 256), scale);
  const device = backend.renderer.device;
  const texture = {
    device,
    texture: device.createTexture({
      size: [tile.image.width, tile.image.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }),
    sampler: device.createSampler({ addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' }),
    samplerOptions: { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
    image: tile.image, format: 'rgba8unorm', srgb: false, flipY: false, uploaded: tile.image,
  };
  device.queue.copyExternalImageToTexture({ source: tile.image }, { texture: texture.texture },
    [tile.image.width, tile.image.height]);
  if (!backend._rasterProgram || backend._rasterProgram.device !== device) {
    // DEM atlas over the archive's tile grid; invalid or missing samples become -1e9 (the shader's no-data).
    // ponytail: one texture, capped by maxTextureDimension2D (32×32 DEM tiles at 8192 px); split it for larger archives.
    const bounds = backend._terrainBounds, columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const { elevations, low, high } = terrainAtlas(backend._terrainTiles, bounds);
    if (backend._dem) destroyTexture(backend, backend._dem.texture);
    backend._dem = {
      texture: device.createTexture({
        size: [columns * 256, rows * 256],
        format: 'r32float',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      }),
      low: Number.isFinite(low) ? low : backend._terrainOriginElevation,
      high: Number.isFinite(high) ? high : backend._terrainOriginElevation,
    };
    device.queue.writeTexture({ texture: backend._dem.texture }, elevations,
      { bytesPerRow: columns * 1024 }, [columns * 256, rows * 256]);
    backend._terrainGrids = new Map();
    backend._rasterProgram = createProgram(backend, {
      baseTexture: texture,
      unlit: true,
      alphaMode: 'BLEND',
      terrain: backend._dem,
    });
  }
  let attributes = backend._terrainGrids.get(divisions);
  if (!attributes) {
    attributes = terrainGrid(divisions);
    for (const [name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = 'uint16';
      attribute.buffer = device.createBuffer({
        size: Math.max(4, attribute.data.byteLength),
        usage: name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    backend._terrainGrids.set(divisions, attributes);
  }
  const base = backend._terrainOriginElevation;
  const bottom = Math.min(backend._dem.low, base) - base, top = Math.max(backend._dem.high, base) - base;
  const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
  // ponytail: ray picking sees the flat unit grid; read the DEM back if terrain must be pickable.
  const geometry = {
    device,
    attributes,
    drawRange: { start: 0, count: attributes.index.count },
    // Local bounds whose radius, scaled by the largest axis, still covers the displaced tile.
    bounds: {
      min: [0, bottom, 0], max: [1, top, 1], center: [0.5, (bottom + top) / 2, 0.5],
      radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ),
    },
  };
  const mesh = {
    position: [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: [0, 0, 0],
    scale: [sizeX, 1, sizeZ],
    worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: [],
    visible: true,
    device,
    geometry,
    program: backend._rasterProgram,
    texture,
    // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
    terrain: [
      coords.x * 256 * terrainScale - backend._terrainBounds.min.x * 256,
      coords.y * 256 * terrainScale - backend._terrainBounds.min.y * 256,
      256 * terrainScale,
      base,
    ],
    tile,
    opacity: layer.options.opacity ?? 1,
    id: L.Layer.types['3d']._nextId++,
    renderOrder: layer.options.zIndex || 0,
  };
  setParent(mesh, backend.root);
  update(backend);
  backend._rasterTiles.set(tile, mesh);
}
