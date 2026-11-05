import { demTexture } from '../globals/demTexture.js';
import { demTarget } from '../globals/demTarget.js';
import { demLayout } from '../globals/demLayout.js';
import { demSize } from '../globals/demSize.js';
import { demBuffer } from '../globals/demBuffer.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { rasterPoint } from '../globals/rasterPoint.js';
import { nextId } from '../globals/nextId.js';



import { createProgram } from '../rendering/createProgram.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { terrainAtlas } from '../terrain/terrainAtlas.js';
import { terrainGrid } from '../terrain/terrainGrid.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export async function addRasterTile(backend, layer, coords, tile) {
  const ready = await sceneByLayer.get(backend)._terrainPromise;
  if (!ready || !backend._map || cameraByMap.get(backend._map)._terrain3D !== backend || sceneByLayer.get(layer)._terrain3D !== backend ||
    tile.request.signal.aborted || !sceneByLayer.get(layer)._rasterTiles.has(`${coords.z}/${coords.x}/${coords.y}`) ||
    sceneByLayer.get(backend)._rasterTiles.has(tile)) {
    return;
  }
  // Match DEM pixel spacing, capped at 64 subdivisions per tile.
  const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - sceneByLayer.get(backend)._terrainZoom)));
  const map = backend._map, crs = map.options.crs;
  const origin = crs.project(sceneByLayer.get(backend).location), metres = Math.cos(sceneByLayer.get(backend).location.lat * Math.PI / 180);
  // Tile pixels map linearly to projected metres: one scaled unit grid per tile, elevation in the vertex shader.
  const scale = crs.scale(coords.z), terrainScale = 2 ** (sceneByLayer.get(backend)._terrainZoom - coords.z);
  const point = rasterPoint;
  point.x = coords.x * 256; point.y = coords.y * 256;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * 256; point.y = (coords.y + 1) * 256;
  const opposite = crs.transformation.untransform(point, scale);
  const device = sceneByLayer.get(backend).renderer.device;
  const texture = tile.texture;
  if (!sceneByLayer.get(backend)._rasterProgram || sceneByLayer.get(backend)._rasterProgram.device !== device) {
    // DEM atlas over the archive's tile grid; invalid or missing samples become -1e9 (the shader's no-data).
    // ponytail: one texture, capped by maxTextureDimension2D (32×32 DEM tiles at 8192 px); split it for larger archives.
    const bounds = sceneByLayer.get(backend)._terrainBounds, columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const { elevations, low, high } = terrainAtlas(sceneByLayer.get(backend)._terrainTiles, bounds);
    if (sceneByLayer.get(backend)._dem) destroyTexture(backend, sceneByLayer.get(backend)._dem.texture);
    sceneByLayer.get(backend)._dem = /* allocation: required -- The terrain backend retains its own DEM GPU texture and elevation range. */ {
      texture: device.createTexture((
      demTexture.size[0] = columns * 256,
      demTexture.size[1] = rows * 256,
      demTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      demTexture
    )),
      low: Number.isFinite(low) ? low : sceneByLayer.get(backend)._terrainOriginElevation,
      high: Number.isFinite(high) ? high : sceneByLayer.get(backend)._terrainOriginElevation,
    };

    device.queue.writeTexture((
      demTarget.texture = sceneByLayer.get(backend)._dem.texture,
      demTarget
    ), elevations,
      (
      demLayout.bytesPerRow = columns * 1024,
      demLayout
    ), (
      demSize[0] = columns * 256,
      demSize[1] = rows * 256,
      demSize
    ));
    demTarget.texture = null;

    sceneByLayer.get(backend)._terrainGrids = /* allocation: required -- The terrain backend owns its device-specific cached grid buffers. */ new Map();
    sceneByLayer.get(backend)._rasterProgram = createProgram(backend, /* allocation: required -- The terrain program retains these device-specific DEM and raster material options. */ {
      baseTexture: texture,
      unlit: true,
      terrain: sceneByLayer.get(backend)._dem,
      alphaMode: 'BLEND',
      depthWrite: true,
    });
  }
  let attributes = sceneByLayer.get(backend)._terrainGrids.get(divisions);
  let name, attribute;
  if (!attributes) {
    attributes = terrainGrid(divisions);
    for ([name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = 'uint16';
      attribute.buffer = device.createBuffer((
        demBuffer.size = Math.max(4, attribute.data.byteLength),
        demBuffer.usage = name === 'index'
          ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        demBuffer
      ));

      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    sceneByLayer.get(backend)._terrainGrids.set(divisions, attributes);
  }
  const base = sceneByLayer.get(backend)._terrainOriginElevation;
  const bottom = Math.min(sceneByLayer.get(backend)._dem.low, base) - base, top = Math.max(sceneByLayer.get(backend)._dem.high, base) - base;
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
    program: sceneByLayer.get(backend)._rasterProgram,
    texture,
    // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
    terrain: /* allocation: required -- Each displaced tile retains its own DEM origin, scale and elevation uniform. */ [
      coords.x * 256 * terrainScale - sceneByLayer.get(backend)._terrainBounds.min.x * 256,
      coords.y * 256 * terrainScale - sceneByLayer.get(backend)._terrainBounds.min.y * 256,
      256 * terrainScale,
      base,
    ],
    tile,
    opacity: layer.options.opacity ?? 1,
    id: nextId.value++,
    renderOrder: layer.options.zIndex || 0,
    fadeDuration: 250,
    fadeStart: tile.loadedAt,
    ground: true,
  };
  tile.mesh.visible = false;
  setParent(mesh, sceneByLayer.get(backend).root);
  update(backend);
  sceneByLayer.get(backend)._rasterTiles.set(tile, mesh);
}
