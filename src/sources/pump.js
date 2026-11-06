import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { inflightByLayer } from '../weakmaps/inflightByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { renderers } from '../weakmaps/renderers.js';



import { emptyNode } from "../scene/emptyNode.js";
import { isClockWise } from "../triangulation/isClockWise.js";
import { lampPostGeometry } from "../geometry/lampPostGeometry.js";
import { lightGeometry } from "../geometry/lightGeometry.js";
import { parseColor } from "../utils/parseColor.js";
import { treeGeometry } from "../geometry/treeGeometry.js";
import { triangulate } from "../triangulation/triangulate.js";
import { createProgram } from '../rendering/createProgram.js';
import { updateStatus } from './updateStatus.js';
import { loadSource } from '../archives/loadSource.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';
import { getElevation } from "../terrain/getElevation.js";

import { buildArea } from './buildArea.js';
import { pendingSourceAreas } from './pendingSourceAreas.js';

/** Share four load/build slots across source layers, nearest ground blocks first. */
export function pump(layer, map = layer._map) {
  const shared = map && renderers.get(map);
  if (!shared) return;
  const layers = /* alloc */ [];
  let sourceLayer, area, areaBackend;
  for (sourceLayer of layersByLayer.get(shared)) {
    if (Number.isFinite(inflightByLayer.get(sourceLayer)) && areasByLayer.get(sourceLayer) && (urlByLayer.get(sourceLayer) || geojsonByLayer.get(sourceLayer))) layers.push(sourceLayer);
  }
  const pending = pendingSourceAreas(layers, map);
  let inflight = 0;
  for (sourceLayer of layers) inflight += inflightByLayer.get(sourceLayer);
  for ({ layer: areaBackend, area } of pending) {
    if (inflight >= 4) break;
    if (inflightByLayer.get(areaBackend) >= 2) continue;
    area.started = true;
    mutateWeakMap(inflightByLayer, areaBackend, "++", undefined, false);
    inflight++;
    buildArea(areaBackend, area, map);
  }
  for (sourceLayer of layers) updateStatus(sourceLayer);
}
