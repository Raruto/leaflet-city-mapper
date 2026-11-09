import { prepareVectorTile } from '../vector-tiles/prepareVectorTile.js';

export function onVectorTileMessage({ data }) {
  try {
    const result = prepareVectorTile(data.buffer, data.coords, data.style, data.zoom, data.source, data.maxZoom);
    self.postMessage(/* alloc */ { id: data.id, ...result });
  } catch (error) {
    self.postMessage(/* alloc */ { id: data.id, error: error.message });
  }
}

self.addEventListener('message', onVectorTileMessage);
