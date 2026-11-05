import { updateRasterTiles } from "./updateRasterTiles.js";

export async function updateAttachedTiles(backend, map, attached) {
  try {
    await Promise.all([attached, backend.ready]);
    if (backend._map === map && map.hasLayer(backend)) updateRasterTiles(backend);
  } catch (error) {
    backend.fire('error', { error });
  }
}
