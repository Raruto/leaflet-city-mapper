import { containerByLayer } from '../weakmaps/containerByLayer.js';
import { cursorByLayer } from '../weakmaps/cursorByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { tooltipByLayer } from '../weakmaps/tooltipByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



/** Update tooltip content/position and arbitrate cursor ownership across shared layers. */

export function showFeature(layer, feature, event) {
  const tooltip = tooltipByLayer.get(layer);
  if (!tooltip) return;
  if (feature) {
    tooltip.replaceChildren(layer.options.tooltip(feature));
    tooltip.hidden = false;
    const rect = containerByLayer.get(layer).getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    tooltip.style.left = `${x + tooltip.offsetWidth + 16 > rect.width ? x - tooltip.offsetWidth - 12 : x + 12}px`;
    tooltip.style.top = `${y + tooltip.offsetHeight + 16 > rect.height ? y - tooltip.offsetHeight - 12 : y + 12}px`;
  } else {
    tooltip.hidden = true;
  }
  const shared = sharedByLayer.get(layer);
  let sharedLayer;
  if (shared) {
    let visible = false;
    for (sharedLayer of layersByLayer.get(shared)) {
      if (tooltipByLayer.get(sharedLayer) && !tooltipByLayer.get(sharedLayer).hidden) {
        visible = true;
        break;
      }
    }
    if (visible) {
      if (cursorByLayer.get(shared) === undefined) mutateWeakMap(cursorByLayer, shared, "=", containerByLayer.get(layer).style.cursor);
      containerByLayer.get(layer).style.cursor = 'pointer';
    } else if (cursorByLayer.get(shared) !== undefined) {
      containerByLayer.get(layer).style.cursor = cursorByLayer.get(shared);
      cursorByLayer.delete(shared);
    }
  }
}
