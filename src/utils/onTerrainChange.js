import { releaseArea } from "./releaseArea.js";
import { updateArea } from "./updateArea.js";

/** GeoJSON source areas: loading, building and releasing. */

export function onTerrainChange(backend) {
  if (!backend._map) return;
  for (const area of backend._areas.values()) releaseArea(backend, area);
  backend._areas.clear();
  updateArea(backend);
}
