import { demByLayer } from '../weakmaps/demByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { terrainOriginElevationByLayer } from '../weakmaps/terrainOriginElevationByLayer.js';


export function terrainTileGeometry(layer, attributes, sizeX, sizeZ) {
  const base = terrainOriginElevationByLayer.get(layer)
  const bottom = Math.min(demByLayer.get(layer).low, base) - base, top = Math.max(demByLayer.get(layer).high, base) - base;
  return /* alloc */ {
    device: rendererByLayer.get(layer).device,
    attributes,
    drawRange: /* alloc */ { start: 0, count: attributes.index.count },
    // Bounds must cover the DEM-displaced tile, although picking uses the flat grid.
    bounds: /* alloc */ {
      min: /* alloc */ [0, bottom, 0], max: /* alloc */ [1, top, 1], center: /* alloc */ [0.5, (bottom + top) / 2, 0.5],
      radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ),
    },
  };
}
