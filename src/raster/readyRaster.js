import { pluginState } from '../core/pluginState.js';
import { getHeader } from "../archives/getHeader.js";

export async function readyRaster(layer, archive) {
  const header = await pluginState(archive).getHeader();
  layer.options.archive = archive;
  pluginState(layer).header = header;
  if (layer.options.maxNativeZoom === undefined) {
    layer.options.maxNativeZoom = header.maxZoom;
  }
  layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
  layer.fire('ready');
  return layer;
}
