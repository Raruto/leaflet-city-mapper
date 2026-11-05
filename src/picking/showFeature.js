import { pluginState } from '../core/pluginState.js';
/** Update tooltip content/position and arbitrate cursor ownership across shared layers. */

export function showFeature(backend, feature, event) {
  const tooltip = pluginState(backend)._tooltip;
  if (!tooltip) return;
  if (feature) {
    tooltip.replaceChildren(backend.options.tooltip(feature));
    tooltip.hidden = false;
    const rect = pluginState(backend).container.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    tooltip.style.left = `${x + tooltip.offsetWidth + 16 > rect.width ? x - tooltip.offsetWidth - 12 : x + 12}px`;
    tooltip.style.top = `${y + tooltip.offsetHeight + 16 > rect.height ? y - tooltip.offsetHeight - 12 : y + 12}px`;
  } else {
    tooltip.hidden = true;
  }
  const shared = pluginState(backend)._shared;
  let layer;
  if (shared) {
    let visible = false;
    for (layer of pluginState(shared)._layers) {
      if (pluginState(layer)._tooltip && !pluginState(layer)._tooltip.hidden) {
        visible = true;
        break;
      }
    }
    if (visible) {
      if (pluginState(shared)._cursor === undefined) pluginState(shared)._cursor = pluginState(backend).container.style.cursor;
      pluginState(backend).container.style.cursor = 'pointer';
    } else if (pluginState(shared)._cursor !== undefined) {
      pluginState(backend).container.style.cursor = pluginState(shared)._cursor;
      delete pluginState(shared)._cursor;
    }
  }
}
