import { pluginState } from '../core/pluginState.js';
import { finishAttachment } from './finishAttachment.js';
import { updateAttachedTiles } from './updateAttachedTiles.js';
import { attach } from '../scene/attach.js';

export function onPMTileAdd(backend, map) {
  if (!pluginState(backend).location) pluginState(backend).location = map.getCenter();
  const attached = attach(backend, map);
  finishAttachment(backend, map, attached);
  updateAttachedTiles(backend, map, attached);
}
