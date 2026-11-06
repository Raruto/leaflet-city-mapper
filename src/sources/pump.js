import { renderers } from '../globals/renderers.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



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
export function pump(backend, map = backend._map) {
  const shared = map && renderers.get(map);
  if (!shared) return;
  const layers = /* alloc */ [];
  let layer, area, areaBackend;
  for (layer of sceneByLayer.get(shared)._layers) {
    if (Number.isFinite(sceneByLayer.get(layer)._inflight) && sceneByLayer.get(layer)._areas && (sceneByLayer.get(layer).url || sceneByLayer.get(layer)._geojson)) layers.push(layer);
  }
  const pending = pendingSourceAreas(layers, map);
  let inflight = 0;
  for (layer of layers) inflight += sceneByLayer.get(layer)._inflight;
  for ({ layer: areaBackend, area } of pending) {
    if (inflight >= 4) break;
    if (sceneByLayer.get(areaBackend)._inflight >= 2) continue;
    area.started = true;
    sceneByLayer.get(areaBackend)._inflight++;
    inflight++;
    buildArea(areaBackend, area, map);
  }
  for (layer of layers) updateStatus(layer);
}
