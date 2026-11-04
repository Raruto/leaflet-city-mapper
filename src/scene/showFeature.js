/** Update tooltip content/position and arbitrate cursor ownership across shared layers. */

export function showFeature(backend, feature, event) {
  const tooltip = backend._tooltip;
  if (!tooltip) return;
  if (feature) {
    tooltip.replaceChildren(backend.options.tooltip(feature));
    tooltip.hidden = false;
    const rect = backend.container.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    tooltip.style.left = `${x + tooltip.offsetWidth + 16 > rect.width ? x - tooltip.offsetWidth - 12 : x + 12}px`;
    tooltip.style.top = `${y + tooltip.offsetHeight + 16 > rect.height ? y - tooltip.offsetHeight - 12 : y + 12}px`;
  } else {
    tooltip.hidden = true;
  }
  const shared = backend._shared;
  if (shared) {
    const visible = [...shared._layers].some(layer => layer._tooltip && !layer._tooltip.hidden);
    if (visible) {
      if (shared._cursor === undefined) shared._cursor = backend.container.style.cursor;
      backend.container.style.cursor = 'pointer';
    } else if (shared._cursor !== undefined) {
      backend.container.style.cursor = shared._cursor;
      delete shared._cursor;
    }
  }
}
