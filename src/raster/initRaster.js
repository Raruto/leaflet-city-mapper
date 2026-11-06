import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { directoriesByLayer } from '../weakmaps/directoriesByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { L } from '../globals/L.js';


import { isLoading } from './isLoading.js';
import { getRasterEvents } from './getRasterEvents.js';
import { readyRaster } from './readyRaster.js';
import { reportError } from './reportError.js';
import { emptyNode } from '../scene/emptyNode.js';
import { read } from '../archives/read.js';
import { getHeader } from '../archives/getHeader.js';
import { getZxy } from '../archives/getZxy.js';
import { onPMTileAdd } from './onPMTileAdd.js';
import { onPMTileRemove } from './onPMTileRemove.js';
import { getRasterTileSize } from './getRasterTileSize.js';
import { setPMTileOpacity } from './setPMTileOpacity.js';
import { setPMTileZIndex } from './setPMTileZIndex.js';

export function initRaster(layer, options) {
  mutateWeakMap(kindByLayer, layer, "=", 'raster');
  options = /* alloc */ { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  mutateWeakMap(rootByLayer, layer, "=", emptyNode());
  mutateWeakMap(areasByLayer, layer, "=", /* alloc */ new Map());
  mutateWeakMap(rasterTilesByLayer, layer, "=", /* alloc */ new Map());
  mutateWeakMap(loadingTilesByLayer, layer, "=", 0);
  mutateWeakMap(addedByLayer, layer, "=", Promise.withResolvers());
  mutateWeakMap(urlByLayer, layer, "=", /* alloc */ new URL(options.url, document.baseURI).href);
  mutateWeakMap(directoriesByLayer, layer, "=", /* alloc */ new Map());
  mutateWeakMap(readyByLayer, layer, "=", Promise.resolve(layer.options.archive || layer)
    .then(readyRaster.bind(null, layer))
    .catch(reportError.bind(null, layer)));
}
