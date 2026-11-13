import { updateRasterTiles } from "./updateRasterTiles.js";

/**
 * Create map event handlers that update a raster layer's visible tiles.
 *
 * @param {L.Layer} layer Raster layer.
 *
 * @returns {Object} Map event names and handlers.
 */
export function getRasterEvents(layer) {
  const update = updateRasterTiles.bind(null, layer);
  return /* alloc */ { moveend: update, zoomend: update, rotate: update, pitch: update, resize: update };
}
