import { getHeader } from "./getHeader.js";

export async function readyRaster(layer, archive) {
  const header = await archive.getHeader();
  layer.options.archive = archive;
  layer.header = header;
  if (layer.options.maxNativeZoom === undefined) {
    layer.options.maxNativeZoom = header.maxZoom;
  }
  layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
  layer.fire('ready');
  return layer;
}
