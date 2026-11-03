import { releaseArea } from './releaseArea.js';
import { updateArea } from './updateArea.js';

export function setGeoJSONData(backend, data) {
  backend.options.data = data;
  delete backend.options.url;
  for (const area of backend._areas.values()) releaseArea(backend, area);
  backend._areas.clear();
  updateArea(backend);
  return backend;
}
