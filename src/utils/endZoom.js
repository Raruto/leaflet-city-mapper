import { update } from "./update";

/** Stop using the outgoing level after zoomend; the next redraw uses current tiles. */

export function endZoom() {
  const backend = this;
  for (const animation of backend._zoomTransitions?.keys() || []) animation.finish();
  backend._zoomTransitions = null;
  backend._zoomLevel = null;
  update(backend);
}
