import { sceneByLayer } from '../globals/sceneByLayer.js';
import { pendingUpdates } from '../globals/pendingUpdates.js';


import { render } from "../rendering/render.js";

import { renderPendingUpdates } from './renderPendingUpdates.js';

/** Scene graph, shared camera and frame rendering. */
/** Content changes: render once on the next animation frame. */
export function update(backend) {
  const shared = sceneByLayer.get(backend)._shared;
  if (!shared) return backend;
  if (shared !== backend) {
    update(shared);
    return backend;
  }
  if (sceneByLayer.get(backend)._frame != null) return backend;
  const first = pendingUpdates.values().next().value;
  pendingUpdates.add(backend);
  sceneByLayer.get(backend)._frame = first ? sceneByLayer.get(first)._frame : requestAnimationFrame(renderPendingUpdates);
  return backend;
}
