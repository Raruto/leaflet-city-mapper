import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { terrainBoundsByLayer } from '../weakmaps/terrainBoundsByLayer.js';
import { terrainOriginElevationByLayer } from '../weakmaps/terrainOriginElevationByLayer.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';
import { terrainZoomByLayer } from '../weakmaps/terrainZoomByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';


import { radians } from '../globals/radians.js';
import { rasterPoint } from '../globals/rasterPoint.js';
import { nextId } from '../globals/nextId.js';
import { rasterProgram } from '../terrain/rasterProgram.js';
import { terrainBuffers } from '../terrain/terrainBuffers.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';
import { terrainTileGeometry } from './terrainTileGeometry.js';

export async function addRasterTile(layer, rasterLayer, coords, tile) {
  const ready = await terrainPromiseByLayer.get(layer);
  if (!ready || !layer._map || terrain3DByMap.get(layer._map) !== layer || terrain3DByLayer.get(rasterLayer) !== layer ||
    tile.request.signal.aborted || !rasterTilesByLayer.get(rasterLayer).has(`${coords.z}/${coords.x}/${coords.y}`) ||
    rasterTilesByLayer.get(layer).has(tile)) {
    return;
  }
  // Match DEM pixel spacing, capped at 64 subdivisions per tile.
  const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - terrainZoomByLayer.get(layer))));
  const map = layer._map, crs = map.options.crs;
  const origin = crs.project(locationByLayer.get(layer)), metres = Math.cos(locationByLayer.get(layer).lat * radians);
  // Tile pixels map linearly to projected metres: one scaled unit grid per tile, elevation in the vertex shader.
  const scale = crs.scale(coords.z), terrainScale = 2 ** (terrainZoomByLayer.get(layer) - coords.z);
  const point = rasterPoint;
  point.x = coords.x * 256; point.y = coords.y * 256;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * 256; point.y = (coords.y + 1) * 256;
  const opposite = crs.transformation.untransform(point, scale);
  const device = rendererByLayer.get(layer).device;
  const texture = tile.texture;
  const program = rasterProgram(layer, texture);
  const attributes = terrainBuffers(layer, divisions);
  const base = terrainOriginElevationByLayer.get(layer);
  const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
  // ponytail: ray picking sees the flat unit grid; read the DEM back if terrain must be pickable.
  const geometry = terrainTileGeometry(layer, attributes, sizeX, sizeZ);
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
      coords.x * 256 * terrainScale - terrainBoundsByLayer.get(layer).min.x * 256,
      coords.y * 256 * terrainScale - terrainBoundsByLayer.get(layer).min.y * 256,
      256 * terrainScale,
      base,
    ],
    tile,
    opacity: rasterLayer.options.opacity ?? 1,
    id: nextId.value++,
    renderOrder: rasterLayer.options.zIndex || 0,
    fadeDuration: 250,
    fadeStart: tile.loadedAt,
    ground: true,
    _rasterSource: rasterLayer,
  };
  tile.mesh.visible = false;
  setParent(mesh, rootByLayer.get(layer));
  update(layer);
  rasterTilesByLayer.get(layer).set(tile, mesh);
}
