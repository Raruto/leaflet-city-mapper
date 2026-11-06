import { sceneByLayer } from '../globals/sceneByLayer.js';
import { underEntry } from './underEntry.js';
import { renderLayerCount } from './renderLayerCount.js';

export function updateLayerCount(event) {
  const layer = event.target, scene = sceneByLayer.get(layer), status = scene._countStatus;
  if (!layer._map) return;
  if (event.type === 'add') underEntry(layer, status);
  let count = 0, pending = 0, error = event.error, area;
  if (Number.isFinite(event.loaded)) {
    count = event.loaded;
    pending = event.pending ?? 0;
    error ||= event.errors?.[0];
  } else {
    for (area of scene._areas.values()) {
      count += area.buildings ?? 0;
      if (!area.done && !area.error) pending++;
      error ||= area.error;
    }
  }
  renderLayerCount(scene, count, pending, error);
}
