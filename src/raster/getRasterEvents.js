import { updateRasterTiles } from "./updateRasterTiles.js";

export function getRasterEvents(layer) {
  const update = updateRasterTiles.bind(null, layer);
  return /* alloc */ { moveend: update, zoomend: update, rotate: update, pitch: update, resize: update };
}
