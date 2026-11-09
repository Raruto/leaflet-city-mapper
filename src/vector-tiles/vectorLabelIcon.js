import { L } from '../globals/L.js';

export function vectorLabelIcon(label) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const width = Math.max(40, Array.from(label.text).length * label.size * 0.65 + 12);
  const height = label.size + 12;
  svg.setAttribute('width', width); svg.setAttribute('height', height);
  const text = document.createElementNS(svg.namespaceURI, 'text');
  const attributes = /* alloc */ {
    x: width / 2, y: label.size + 2, 'text-anchor': 'middle',
    'font-family': 'sans-serif', 'font-size': label.size,
    fill: label.color, stroke: label.halo, 'stroke-width': label.haloWidth * 2, 'paint-order': 'stroke',
  };
  let key;
  for (key of Object.keys(attributes)) text.setAttribute(key, attributes[key]);
  text.textContent = label.text;
  svg.append(text);
  return /* alloc */ new L.Icon(/* alloc */ {
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent((/* alloc */ new XMLSerializer()).serializeToString(svg))}`,
    iconSize: /* alloc */ [width, height], iconAnchor: /* alloc */ [width / 2, height / 2],
  });
}
