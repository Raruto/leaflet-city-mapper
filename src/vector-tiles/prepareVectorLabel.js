import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { vectorStyleValue } from './vectorStyleValue.js';
import { vectorLabelAnchors } from './vectorLabelAnchors.js';
import { vectorLabelText } from './vectorLabelText.js';
import { createVectorLabel } from './createVectorLabel.js';

export function prepareVectorLabel(job, layer, entry, feature, order) {
  const { properties } = feature, { zoom } = job;
  const text = vectorLabelText(entry, properties, zoom);
  const icon = entry.layout?.['symbol-placement'] === 'line' ? null
    : evaluateStyle(entry.layout?.['icon-image'], properties, zoom);
  if (!text.trim() && typeof icon !== 'string') return;
  const size = vectorStyleValue(entry.layout, 'text-size', 12, properties, zoom), line = feature.type === 2 && text.trim();
  const spacing = layer.extent / 16, anchors = /* alloc */ [];
  let path, anchor;
  for (path of line ? feature.geometry : feature.geometry.slice(0, 1)) {
    if (!path?.length) continue;
    if (!line) anchors.push(/* alloc */ { point: path[Math.floor(path.length / 2)], a: null });
    else for (anchor of vectorLabelAnchors(path, spacing)) anchors.push(anchor);
  }
  for (anchor of anchors) {
    if (anchor.point[0] < 0 || anchor.point[0] >= layer.extent || anchor.point[1] < 0 || anchor.point[1] >= layer.extent) continue;
    job.labels.push(createVectorLabel(job, layer, entry, properties, order, text, icon, anchor, size));
  }
}
