import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { countStatusByLayer } from '../weakmaps/countStatusByLayer.js';

import { underEntry } from './underEntry.js';
import { renderLayerCount } from './renderLayerCount.js';

export function updateLayerCount(event) {
  const layer = event.target, status = countStatusByLayer.get(layer)
  if (!layer._map) return;
  if (event.type === 'add') underEntry(layer, status);
  let count = 0, pending = 0, error = event.error, area;
  if (Number.isFinite(event.loaded)) {
    count = event.loaded;
    pending = event.pending ?? 0;
    error ||= event.errors?.[0];
  } else {
    for (area of areasByLayer.get(layer).values()) {
      count += area.buildings ?? 0;
      if (!area.done && !area.error) pending++;
      error ||= area.error;
    }
  }
  renderLayerCount(layer, count, pending, error);
}
