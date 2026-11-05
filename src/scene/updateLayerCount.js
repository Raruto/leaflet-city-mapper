import { sceneByLayer } from '../globals/sceneByLayer.js';
import { underEntry } from './underEntry.js';

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
  if (scene.modelUrl) count = scene.model ? 1 : 0;
  const loading = pending || (scene.modelUrl ? !scene.model : !scene.header && !scene._geojson);
  const formatted = count.toLocaleString('en-US');
  const text = error ? 'Error' : `${formatted}${loading ? '…' : ''}`;
  const title = error ? `Unable to load: ${typeof error === 'string' ? error : error.message}` :
    `${formatted} loaded ${scene.modelUrl ? 'models' : 'elements'} in the current area${pending ? `; ${pending} blocks loading` : ''}`;
  if (status.textContent !== text) status.textContent = text;
  if (status.title !== title) status.title = title;
  if (error && status.getAttribute('role') !== 'alert') status.setAttribute('role', 'alert');
  else if (!error && status.hasAttribute('role')) status.removeAttribute('role');
}
