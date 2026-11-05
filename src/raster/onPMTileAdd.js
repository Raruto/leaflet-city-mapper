import { finishAttachment } from './finishAttachment.js';
import { updateAttachedTiles } from './updateAttachedTiles.js';
import { attach } from '../scene/attach.js';

export function onPMTileAdd(backend, map) {
  if (!backend.location) backend.location = map.getCenter();
  const attached = attach(backend, map);
  finishAttachment(backend, map, attached);
  updateAttachedTiles(backend, map, attached);
}
