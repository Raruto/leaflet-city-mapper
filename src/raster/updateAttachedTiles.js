import { pluginState } from '../core/pluginState.js';
import { updateRasterTiles } from "./updateRasterTiles.js";

export async function updateAttachedTiles(backend, map, attached) {
  try {
    await Promise.all(/* allocation: required -- Each async attachment operation tracks its own attachment and archive-readiness promises. */ [attached, pluginState(backend).ready]);
    if (backend._map === map && map.hasLayer(backend)) updateRasterTiles(backend);
  } catch (error) {
    backend.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error });
  }
}
