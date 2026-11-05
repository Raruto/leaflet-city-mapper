import { sceneByLayer } from '../globals/sceneByLayer.js';


import { updateRasterTiles } from "./updateRasterTiles.js";

export async function updateAttachedTiles(backend, map, attached) {
  try {
    await Promise.all(/* alloc */ [attached, sceneByLayer.get(backend).ready]);
    if (backend._map === map && map.hasLayer(backend)) updateRasterTiles(backend);
  } catch (error) {
    backend.fire('error', /* alloc */ { error });
  }
}
