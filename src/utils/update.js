import { render } from "./render";

/** Scene graph, shared camera and frame rendering. */
/** Content changes: render once on the next animation frame. */

export function update(backend) {
  const shared = backend._shared;
  if (!shared) return backend;
  if (shared !== backend) {
    update(shared);
    return backend;
  }
  backend._frame ||= requestAnimationFrame(() => {
    backend._frame = null;
    if (backend._shared === backend && backend.renderer) render(backend);
  });
  return backend;
}
