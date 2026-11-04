import { update } from "./update.js";
import { render } from "./render.js";

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */

export function onMapChange() {
  const layer = this;
  if (layer._queued) return;
  layer._queued = true;
  queueMicrotask(() => {
    layer._queued = false;
    if (layer._shared !== layer || !layer.renderer) return;
    if (layer._map._animatingZoom) update(layer);
    else render(layer);
  });
}
