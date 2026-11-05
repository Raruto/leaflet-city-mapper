import { sceneByLayer } from '../globals/sceneByLayer.js';


import { releaseArea } from '../sources/releaseArea.js';
import { updateArea } from "../sources/updateArea.js";

/** GeoJSON source areas: loading, building and releasing. */

export function onTerrainChange(layer) {
  if (!layer._map) return;
  let area;
  for (area of sceneByLayer.get(layer)._areas.values()) {
    releaseArea(layer, area);
  }
  sceneByLayer.get(layer)._areas.clear();
  updateArea(layer);
}
