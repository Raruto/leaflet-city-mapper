import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { releaseArea } from '../sources/releaseArea.js';
import { updateArea } from "../sources/updateArea.js";

/**
 * Release and reload source areas when terrain changes.
 *
 * @param {L.Layer} layer Source layer to update.
 */
export function onTerrainChange(layer) {
  if (!layer._map) return;
  let area;
  for (area of areasByLayer.get(layer).values()) {
    releaseArea(layer, area);
  }
  areasByLayer.get(layer).clear();
  updateArea(layer);
}
