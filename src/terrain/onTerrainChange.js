import { areasByLayer } from '../weakmaps/areasByLayer.js';



import { releaseArea } from '../sources/releaseArea.js';
import { updateArea } from "../sources/updateArea.js";

/** GeoJSON source areas: loading, building and releasing. */

export function onTerrainChange(layer) {
  if (!layer._map) return;
  let area;
  for (area of areasByLayer.get(layer).values()) {
    releaseArea(layer, area);
  }
  areasByLayer.get(layer).clear();
  updateArea(layer);
}
