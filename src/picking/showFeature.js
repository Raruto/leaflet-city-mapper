import { sceneByLayer } from '../globals/sceneByLayer.js';


/** Update tooltip content/position and arbitrate cursor ownership across shared layers. */

export function showFeature(backend, feature, event) {
  const tooltip = sceneByLayer.get(backend)._tooltip;
  if (!tooltip) return;
  if (feature) {
    tooltip.replaceChildren(backend.options.tooltip(feature));
    tooltip.hidden = false;
    const rect = sceneByLayer.get(backend).container.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    tooltip.style.left = `${x + tooltip.offsetWidth + 16 > rect.width ? x - tooltip.offsetWidth - 12 : x + 12}px`;
    tooltip.style.top = `${y + tooltip.offsetHeight + 16 > rect.height ? y - tooltip.offsetHeight - 12 : y + 12}px`;
  } else {
    tooltip.hidden = true;
  }
  const shared = sceneByLayer.get(backend)._shared;
  let layer;
  if (shared) {
    let visible = false;
    for (layer of sceneByLayer.get(shared)._layers) {
      if (sceneByLayer.get(layer)._tooltip && !sceneByLayer.get(layer)._tooltip.hidden) {
        visible = true;
        break;
      }
    }
    if (visible) {
      if (sceneByLayer.get(shared)._cursor === undefined) sceneByLayer.get(shared)._cursor = sceneByLayer.get(backend).container.style.cursor;
      sceneByLayer.get(backend).container.style.cursor = 'pointer';
    } else if (sceneByLayer.get(shared)._cursor !== undefined) {
      sceneByLayer.get(backend).container.style.cursor = sceneByLayer.get(shared)._cursor;
      delete sceneByLayer.get(shared)._cursor;
    }
  }
}
