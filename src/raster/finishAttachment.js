import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';




import { setRasterTerrain } from "./setRasterTerrain.js";

export async function finishAttachment(layer, map, attached) {
  try {
    await attached;
    addedByLayer.get(layer).resolve();
    setRasterTerrain(layer, terrain3DByMap.get(map));
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
