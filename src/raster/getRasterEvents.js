import { updateRasterTiles } from "./updateRasterTiles.js";

export function getRasterEvents(layer) {
  const update = updateRasterTiles.bind(null, layer);
  return /* allocation: required -- Leaflet retains a separate event-to-bound-handler table for each raster layer. */ { moveend: update, zoomend: update, rotate: update, pitch: update, resize: update };
}
