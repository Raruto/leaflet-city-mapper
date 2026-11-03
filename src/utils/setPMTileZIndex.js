import { update as updateScene } from './update.js';

export function setPMTileZIndex(backend, zIndex) {
  L.TileLayer.prototype.setZIndex.call(backend, zIndex);
  const renderer = L.Layer.types['3d']._renderers.get(backend._map);
  if (renderer) updateScene(renderer);
  return backend;
}
