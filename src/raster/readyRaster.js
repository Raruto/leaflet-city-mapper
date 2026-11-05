import { sceneByLayer } from '../globals/sceneByLayer.js';


import { getHeader } from "../archives/getHeader.js";

export async function readyRaster(layer, archive) {
  const header = await getHeader(archive);
  layer.options.archive = archive;
  sceneByLayer.get(layer).header = header;
  if (layer.options.maxNativeZoom === undefined) {
    layer.options.maxNativeZoom = header.maxZoom;
  }
  layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
  layer.fire('ready');
  return layer;
}
