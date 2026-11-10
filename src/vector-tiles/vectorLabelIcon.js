import { L } from '../globals/L.js';
import { vectorSpriteIcon } from './vectorSpriteIcon.js';
import { wrapVectorLabel } from './wrapVectorLabel.js';

export function vectorLabelIcon(label, sheet) {
  if (label.icon) return vectorSpriteIcon(label, sheet);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const lines = label.along ? /* alloc */ [label.text] : wrapVectorLabel(label.text);
  let longest = 0, line, key, text, index;
  for (line of lines) longest = Math.max(longest, Array.from(line).length);
  const width = Math.max(40, longest * label.size * 0.65 + 12);
  const lineHeight = label.size * 1.2, height = lines.length * lineHeight + 12;
  svg.setAttribute('width', width); svg.setAttribute('height', height);
  const attributes = /* alloc */ {
    x: width / 2, 'text-anchor': 'middle',
    'font-family': 'sans-serif', 'font-size': label.size,
    fill: label.color, stroke: label.halo, 'stroke-width': label.haloWidth * 2, 'paint-order': 'stroke',
  };
  for (index = 0; index < lines.length; index++) {
    text = document.createElementNS(svg.namespaceURI, 'text');
    for (key of Object.keys(attributes)) text.setAttribute(key, attributes[key]);
    text.setAttribute('y', height / 2 + (index - (lines.length - 1) / 2) * lineHeight + label.size * 0.35);
    text.textContent = lines[index];
    svg.append(text);
  }
  return /* alloc */ new L.Icon(/* alloc */ {
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent((/* alloc */ new XMLSerializer()).serializeToString(svg))}`,
    iconSize: /* alloc */ [width, height], iconAnchor: /* alloc */ [width / 2, height / 2],
  });
}
