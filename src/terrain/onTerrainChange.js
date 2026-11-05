import { releaseArea } from '../scene/sources/releaseArea.js';
import { updateArea } from "../scene/sources/updateArea.js";

/** GeoJSON source areas: loading, building and releasing. */

export function onTerrainChange(layer) {
  if (!layer._map) return;
  for (const area of layer._areas.values()) {
    releaseArea(layer, area);
  }
  layer._areas.clear();
  updateArea(layer);
}
