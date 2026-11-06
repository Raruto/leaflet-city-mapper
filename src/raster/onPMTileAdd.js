import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { finishAttachment } from './finishAttachment.js';
import { updateAttachedTiles } from './updateAttachedTiles.js';
import { attach } from '../scene/attach.js';

export function onPMTileAdd(layer, map) {
  if (!locationByLayer.get(layer)) mutateWeakMap(locationByLayer, layer, "=", map.getCenter());
  const attached = attach(layer, map);
  finishAttachment(layer, map, attached);
  updateAttachedTiles(layer, map, attached);
}
