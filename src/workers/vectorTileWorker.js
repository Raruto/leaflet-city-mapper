import { prepareVectorTile } from '../vector-tiles/prepareVectorTile.js';

/**
 * Prepare a vector tile in the worker and return its request ID with the result or error.
 *
 * @param {MessageEvent} event Request containing tile data and rendering options.
 */
export function onVectorTileMessage({ data }) {
  try {
    const result = prepareVectorTile(data.buffer, data.coords, data.style, data.zoom, data.source, data.maxZoom, data.mapZoom);
    self.postMessage(/* alloc */ { id: data.id, ...result });
  } catch (error) {
    self.postMessage(/* alloc */ { id: data.id, error: error.message });
  }
}
