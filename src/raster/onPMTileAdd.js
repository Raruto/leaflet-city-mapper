import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { finishAttachment } from './finishRasterAttachment.js';
import { updateAttachedTiles } from './updateAttachedTiles.js';
import { attach } from '../scene/attachSharedScene.js';

/**
 * Attach a raster layer to the shared scene and start updating its tiles when ready.
 *
 * @param {L.Layer} layer Raster layer being added.
 * @param {L.Map} map Map receiving the layer.
 */
export function onPMTileAdd(layer, map) {
  if (!locationByLayer.get(layer)) locationByLayer.set(layer, map.getCenter());
  const attached = attach(layer, map);
  finishAttachment(layer, map, attached);
  updateAttachedTiles(layer, map, attached);
}
