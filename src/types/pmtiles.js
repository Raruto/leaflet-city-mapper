import { read } from '../utils/read.js';
import { getHeader } from '../utils/getHeader.js';
import { getZxy } from '../utils/getZxy.js';
import { onPMTileAdd } from '../utils/onPMTileAdd.js';
import { onPMTileRemove } from '../utils/onPMTileRemove.js';
import { updateRasterTiles } from '../utils/rasterTiles.js';

import { emptyNode } from '../utils/emptyNode.js';

/** Raster PMTiles rendered as textured meshes in the shared WebGPU canvas. */
L.Layer.types.pmtiles = (layer, options) => {
  layer._read = (offset, length, signal) => read(layer, offset, length, signal);
  layer.getHeader = () => getHeader(layer);
  layer.getZxy = (z, x, y, signal) => getZxy(layer, z, x, y, signal);
  layer.onAdd = map => onPMTileAdd(layer, map);
  layer.onRemove = map => onPMTileRemove(layer, map);
  const update = () => updateRasterTiles(layer);
  layer.getEvents = () => ({
    moveend: update,
    zoomend: update,
    rotate: update,
    pitch: update,
    resize: update,
  });
  options = { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  layer.root = emptyNode();
  layer._areas = new Map();
  layer._rasterTiles = new Map();
  layer._loadingTiles = 0;
  layer._added = Promise.withResolvers();
  layer.url = new URL(options.url, document.baseURI).href;
  layer._directories = new Map();
  layer.ready = Promise.resolve(layer.options.archive || layer).then(async (archive) => {
    const header = await archive.getHeader();
    layer.options.archive = archive;
    layer.header = header;
    if (layer.options.maxNativeZoom === undefined) {
      layer.options.maxNativeZoom = header.maxZoom;
    }
    layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
    layer.fire('ready');
    return layer;
  }).catch(error => {
    layer.fire('error', { error });
    throw error;
  });
};
