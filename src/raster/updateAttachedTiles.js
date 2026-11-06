import { readyByLayer } from '../weakmaps/readyByLayer.js';



import { updateRasterTiles } from "./updateRasterTiles.js";

export async function updateAttachedTiles(layer, map, attached) {
  try {
    await Promise.all(/* alloc */ [attached, readyByLayer.get(layer)]);
    if (layer._map === map && map.hasLayer(layer)) updateRasterTiles(layer);
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
