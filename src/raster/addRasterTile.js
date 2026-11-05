import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { createProgram } from '../rendering/createProgram.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { terrainAtlas } from '../terrain/terrainAtlas.js';
import { terrainGrid } from '../terrain/terrainGrid.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export async function addRasterTile(backend, layer, coords, tile) {
  const gpuCreateTexture1 = sharedState.allocationRenderAddRasterTileCreateTexture1;
  const gpuWriteTexture2 = sharedState.allocationRenderAddRasterTileWriteTexture2;
  const gpuWriteTexture3 = sharedState.allocationRenderAddRasterTileWriteTexture3;
  const gpuWriteTexture4 = sharedState.allocationRenderAddRasterTileWriteTexture4;
  const gpuCreateBuffer5 = sharedState.allocationRenderAddRasterTileCreateBuffer5;
  const ready = await pluginState(backend)._terrainPromise;
  if (!ready || !backend._map || pluginState(backend._map)._terrain3D !== backend || pluginState(layer)._terrain3D !== backend ||
    tile.request.signal.aborted || !pluginState(layer)._rasterTiles.has(`${coords.z}/${coords.x}/${coords.y}`) ||
    pluginState(backend)._rasterTiles.has(tile)) {
    return;
  }
  // Match DEM pixel spacing, capped at 64 subdivisions per tile.
  const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - pluginState(backend)._terrainZoom)));
  const map = backend._map, crs = map.options.crs;
  const origin = crs.project(pluginState(backend).location), metres = Math.cos(pluginState(backend).location.lat * Math.PI / 180);
  // Tile pixels map linearly to projected metres: one scaled unit grid per tile, elevation in the vertex shader.
  const scale = crs.scale(coords.z), terrainScale = 2 ** (pluginState(backend)._terrainZoom - coords.z);
  const point = sharedState.allocationRenderRasterPoint;
  point.x = coords.x * 256; point.y = coords.y * 256;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * 256; point.y = (coords.y + 1) * 256;
  const opposite = crs.transformation.untransform(point, scale);
  const device = pluginState(backend).renderer.device;
  const texture = tile.texture;
  if (!pluginState(backend)._rasterProgram || pluginState(backend)._rasterProgram.device !== device) {
    // DEM atlas over the archive's tile grid; invalid or missing samples become -1e9 (the shader's no-data).
    // ponytail: one texture, capped by maxTextureDimension2D (32×32 DEM tiles at 8192 px); split it for larger archives.
    const bounds = pluginState(backend)._terrainBounds, columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const { elevations, low, high } = terrainAtlas(pluginState(backend)._terrainTiles, bounds);
    if (pluginState(backend)._dem) destroyTexture(backend, pluginState(backend)._dem.texture);
    pluginState(backend)._dem = /* allocation: required -- The terrain backend retains its own DEM GPU texture and elevation range. */ {
      texture: device.createTexture((
      gpuCreateTexture1.size[0] = columns * 256,
      gpuCreateTexture1.size[1] = rows * 256,
      gpuCreateTexture1.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      gpuCreateTexture1
    )),
      low: Number.isFinite(low) ? low : pluginState(backend)._terrainOriginElevation,
      high: Number.isFinite(high) ? high : pluginState(backend)._terrainOriginElevation,
    };

    device.queue.writeTexture((
      gpuWriteTexture2.texture = pluginState(backend)._dem.texture,
      gpuWriteTexture2
    ), elevations,
      (
      gpuWriteTexture3.bytesPerRow = columns * 1024,
      gpuWriteTexture3
    ), (
      gpuWriteTexture4[0] = columns * 256,
      gpuWriteTexture4[1] = rows * 256,
      gpuWriteTexture4
    ));
    gpuWriteTexture2.texture = null;

    pluginState(backend)._terrainGrids = /* allocation: required -- The terrain backend owns its device-specific cached grid buffers. */ new Map();
    pluginState(backend)._rasterProgram = createProgram(backend, /* allocation: required -- The terrain program retains these device-specific DEM and raster material options. */ {
      baseTexture: texture,
      unlit: true,
      terrain: pluginState(backend)._dem,
      alphaMode: 'BLEND',
      depthWrite: true,
    });
  }
  let attributes = pluginState(backend)._terrainGrids.get(divisions);
  let name, attribute;
  if (!attributes) {
    attributes = terrainGrid(divisions);
    for ([name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = 'uint16';
      attribute.buffer = device.createBuffer((
        gpuCreateBuffer5.size = Math.max(4, attribute.data.byteLength),
        gpuCreateBuffer5.usage = name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        gpuCreateBuffer5
      ));

      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    pluginState(backend)._terrainGrids.set(divisions, attributes);
  }
  const base = pluginState(backend)._terrainOriginElevation;
  const bottom = Math.min(pluginState(backend)._dem.low, base) - base, top = Math.max(pluginState(backend)._dem.high, base) - base;
  const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
  // ponytail: ray picking sees the flat unit grid; read the DEM back if terrain must be pickable.
  const geometry = /* allocation: required -- Each displaced tile mesh retains independent geometry and culling metadata. */ {
    device,
    attributes,
    drawRange: /* allocation: required -- Each displaced tile retains its independently mutable draw range. */ { start: 0, count: attributes.index.count },
    // Local bounds whose radius, scaled by the largest axis, still covers the displaced tile.
    bounds: /* allocation: required -- Each displaced tile retains its own elevation-aware culling bounds. */ {
      min: /* allocation: required -- The displaced tile bounds own their minimum coordinate vector. */ [0, bottom, 0], max: /* allocation: required -- The displaced tile bounds own their maximum coordinate vector. */ [1, top, 1], center: /* allocation: required -- The displaced tile bounds own their center coordinate vector. */ [0.5, (bottom + top) / 2, 0.5],
      radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ),
    },
  };
  const mesh = /* allocation: required -- The terrain scene retains this displaced tile mesh until tile removal. */ {
    position: /* allocation: required -- Each displaced tile owns its mutable scene position. */ [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: /* allocation: required -- Each displaced tile owns its mutable scene rotation. */ [0, 0, 0],
    scale: /* allocation: required -- Each displaced tile owns its mutable scene scale. */ [sizeX, 1, sizeZ],
    worldMatrix: /* allocation: required -- Each displaced tile owns its mutable world-transform matrix. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* allocation: required -- Each displaced tile owns its scene-child list. */ [],
    visible: true,
    device,
    geometry,
    program: pluginState(backend)._rasterProgram,
    texture,
    // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
    terrain: /* allocation: required -- Each displaced tile retains its own DEM origin, scale and elevation uniform. */ [
      coords.x * 256 * terrainScale - pluginState(backend)._terrainBounds.min.x * 256,
      coords.y * 256 * terrainScale - pluginState(backend)._terrainBounds.min.y * 256,
      256 * terrainScale,
      base,
    ],
    tile,
    opacity: layer.options.opacity ?? 1,
    id: sharedState.nextId++,
    renderOrder: layer.options.zIndex || 0,
    fadeDuration: 250,
    fadeStart: tile.loadedAt,
    ground: true,
  };
  tile.mesh.visible = false;
  setParent(mesh, pluginState(backend).root);
  update(backend);
  pluginState(backend)._rasterTiles.set(tile, mesh);
}
