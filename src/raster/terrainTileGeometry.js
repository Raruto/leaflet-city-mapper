import { sceneByLayer } from '../globals/sceneByLayer.js';

export function terrainTileGeometry(backend, attributes, sizeX, sizeZ) {
  const scene = sceneByLayer.get(backend), base = scene._terrainOriginElevation;
  const bottom = Math.min(scene._dem.low, base) - base, top = Math.max(scene._dem.high, base) - base;
  return /* alloc */ {
    device: scene.renderer.device,
    attributes,
    drawRange: /* alloc */ { start: 0, count: attributes.index.count },
    // Bounds must cover the DEM-displaced tile, although picking uses the flat grid.
    bounds: /* alloc */ {
      min: /* alloc */ [0, bottom, 0], max: /* alloc */ [1, top, 1], center: /* alloc */ [0.5, (bottom + top) / 2, 0.5],
      radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ),
    },
  };
}
