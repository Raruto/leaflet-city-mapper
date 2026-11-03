import { update } from "./update.js";
import { render } from "./render.js";

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */

export function onMapChange() {
  const backend = this;
  if (backend._queued) return;
  backend._queued = true;
  queueMicrotask(() => {
    backend._queued = false;
    if (backend._shared !== backend || !backend.renderer) return;
    if (backend._map._animatingZoom) update(backend);
    else render(backend);
  });
}
