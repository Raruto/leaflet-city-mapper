import { update as updateScene } from './update.js';

export function setPMTileOpacity(backend, opacity) {
  L.TileLayer.prototype.setOpacity.call(backend, opacity);
  const renderer = L.Layer.types['3d']._renderers.get(backend._map);
  if (renderer) updateScene(renderer);
  return backend;
}
