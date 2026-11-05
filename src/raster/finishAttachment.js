import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { setRasterTerrain } from "./setRasterTerrain.js";

export async function finishAttachment(backend, map, attached) {
  try {
    await attached;
    sceneByLayer.get(backend)._added.resolve();
    setRasterTerrain(backend, cameraByMap.get(map)._terrain3D);
  } catch (error) {
    backend.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error });
  }
}
