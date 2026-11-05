import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { rasterPoint } from '../globals/rasterPoint.js';
import { nextId } from '../globals/nextId.js';
import { rasterProgram } from '../terrain/rasterProgram.js';
import { terrainBuffers } from '../terrain/terrainBuffers.js';
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
  const origin = crs.project(sceneByLayer.get(backend).location), metres = Math.cos(sceneByLayer.get(backend).location.lat * radians);
  // Tile pixels map linearly to projected metres: one scaled unit grid per tile, elevation in the vertex shader.
  const scale = crs.scale(coords.z), terrainScale = 2 ** (sceneByLayer.get(backend)._terrainZoom - coords.z);
  const point = rasterPoint;
  point.x = coords.x * 256; point.y = coords.y * 256;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * 256; point.y = (coords.y + 1) * 256;
  const opposite = crs.transformation.untransform(point, scale);
  const device = sceneByLayer.get(backend).renderer.device;
  const texture = tile.texture;
  const program = rasterProgram(backend, texture);
  const attributes = terrainBuffers(backend, divisions);
  const base = sceneByLayer.get(backend)._terrainOriginElevation;
  const bottom = Math.min(sceneByLayer.get(backend)._dem.low, base) - base, top = Math.max(sceneByLayer.get(backend)._dem.high, base) - base;
  const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
  // ponytail: ray picking sees the flat unit grid; read the DEM back if terrain must be pickable.
  const geometry = /* alloc */ {
    device,
    attributes,
    drawRange: /* alloc */ { start: 0, count: attributes.index.count },
    // Local bounds whose radius, scaled by the largest axis, still covers the displaced tile.
    bounds: /* alloc */ {
      min: /* alloc */ [0, bottom, 0], max: /* alloc */ [1, top, 1], center: /* alloc */ [0.5, (bottom + top) / 2, 0.5],
      radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ),
    },
  };
  const mesh = /* alloc */ {
    position: /* alloc */ [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: /* alloc */ [0, 0, 0],
    scale: /* alloc */ [sizeX, 1, sizeZ],
    worldMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* alloc */ [],
    visible: true,
    device,
    geometry,
    program,
    texture,
    // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
    terrain: /* alloc */ [
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
    _rasterSource: layer,
  };
  tile.mesh.visible = false;
  setParent(mesh, sceneByLayer.get(backend).root);
  update(backend);
  sceneByLayer.get(backend)._rasterTiles.set(tile, mesh);
}
