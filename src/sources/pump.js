import { cityMapper } from '../constants/cityMapper.js';
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
import { pumpState } from '../constants/pumpState.js';
import { compareDistance } from '../utils/compareDistance.js';
import { buildArea } from './buildArea.js';

pumpState.triangleContexts = [];

/** Share four load/build slots across source layers, nearest ground blocks first. */
export function pump(backend, map = backend._map) {
  const shared = map && cityMapper.renderers.get(map);
  if (!shared) return;
  const layers = [];
  let layer, area, center, areaBackend;
  for (layer of shared._layers) {
    if (Number.isFinite(layer._inflight) && layer._areas && (layer.url || layer._geojson)) layers.push(layer);
  }
  const pending = [];
  for (layer of layers) {
    for (area of layer._areas.values()) {
      if (area.started || area.request.signal.aborted) continue;
      center = area.coords && map.project(map.getCenter(), area.coords.z).divideBy(256);
      pending.push({
        layer, area,
        distance: center
          ? Math.hypot(area.coords.x + 0.5 - center.x, area.coords.y + 0.5 - center.y) / 2 ** area.coords.z : 0,
      });
    }
  }
  pending.sort(compareDistance);
  let inflight = 0;
  for (layer of layers) inflight += layer._inflight;
  for ({ layer: areaBackend, area } of pending) {
    if (inflight >= 4) break;
    if (areaBackend._inflight >= 2) continue;
    area.started = true;
    areaBackend._inflight++;
    inflight++;
    buildArea(areaBackend, area, map);
  }
  for (layer of layers) updateStatus(layer);
}
