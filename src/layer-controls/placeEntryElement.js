import { L } from '../globals/L.js';

export function placeEntryElement(input, layer, element) {
  const label = input.closest('label');
  if (element.classList.contains('layer-count')) {
    if (!input.hasAttribute('aria-label')) input.setAttribute('aria-label', label.textContent.trim());
    element.id = `leaflet-layer-count-${L.Util.stamp(layer)}`;
    input.setAttribute('aria-describedby', element.id);
    label.append(element);
  }
  else if (element.classList.contains('traffic-status')) {
    let group = label.nextElementSibling;
    if (!group?.classList.contains('traffic-status-group')) {
      group = L.DomUtil.create('div', 'traffic-status-group');
      group.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 8px;max-width:200px;margin:2px 0 6px 20px;';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Traffic counts');
      label.after(group);
    }
    group.append(element);
  } else label.after(element);
}
