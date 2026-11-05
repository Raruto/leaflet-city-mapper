import { pluginState } from '../core/pluginState.js';
import { setRasterTerrain } from "./setRasterTerrain.js";

export async function finishAttachment(backend, map, attached) {
  try {
    await attached;
    pluginState(backend)._added.resolve();
    setRasterTerrain(backend, pluginState(map)._terrain3D);
  } catch (error) {
    backend.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error });
  }
}
