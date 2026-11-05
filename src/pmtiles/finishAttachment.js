import { setRasterTerrain } from "./setRasterTerrain.js";

export async function finishAttachment(backend, map, attached) {
  try {
    await attached;
    backend._added.resolve();
    setRasterTerrain(backend, map._terrain3D);
  } catch (error) {
    backend.fire('error', { error });
  }
}
