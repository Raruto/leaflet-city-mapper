import { render } from "../rendering/render.js";
import { pendingUpdates } from '../constants/pendingUpdates.js';
import { renderPendingUpdates } from './renderPendingUpdates.js';

/** Scene graph, shared camera and frame rendering. */
/** Content changes: render once on the next animation frame. */
export function update(backend) {
  const shared = backend._shared;
  if (!shared) return backend;
  if (shared !== backend) {
    update(shared);
    return backend;
  }
  if (backend._frame != null) return backend;
  const first = pendingUpdates.values().next().value;
  pendingUpdates.add(backend);
  backend._frame = first ? first._frame : requestAnimationFrame(renderPendingUpdates);
  return backend;
}
