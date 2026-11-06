import { sceneByLayer } from '../globals/sceneByLayer.js';
import { roofFootprint } from './roofFootprint.js';
import { subtractRoofTile } from './subtractRoofTile.js';

/** Test the mesh's ground footprint against loaded imagery, including coarse parent tiles. */
export function roofCoverage(mesh, backend, rasters) {
  let intersectsArchive = false, pending = false;
  let layer, footprint, remaining, tile;
  for (layer of rasters) {
    if (!sceneByLayer.get(layer).header) { pending = true; continue; }
    footprint = roofFootprint(mesh, backend, layer);
    if (!footprint) continue;
    intersectsArchive = true;
    remaining = /* alloc */ [footprint];
    for (tile of sceneByLayer.get(layer)._rasterTiles.values()) {
      // Failed imagery already reports an error; do not hide the building indefinitely.
      if (!tile.done && !tile.error) continue;
      remaining = subtractRoofTile(remaining, tile, sceneByLayer.get(layer)._tileZoom);
      if (!remaining.length) return true;
    }
  }
  return !intersectsArchive && !pending;
}
