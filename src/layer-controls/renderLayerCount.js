import { countStatusByLayer } from '../weakmaps/countStatusByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { modelByLayer } from '../weakmaps/modelByLayer.js';
import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';

export function renderLayerCount(layer, count, pending, error) {
  const status = countStatusByLayer.get(layer);
  const modelUrl = modelUrlByLayer.get(layer), model = modelByLayer.get(layer);
  if (modelUrl) count = model ? 1 : 0;
  const loading = pending || (modelUrl ? !model : !headerByLayer.get(layer) && !geojsonByLayer.get(layer));
  const formatted = count.toLocaleString('en-US');
  const text = error ? 'Error' : `${formatted}${loading ? '…' : ''}`;
  const title = layerCountTitle(layer, formatted, pending, error);
  if (status.textContent !== text) status.textContent = text;
  if (status.title !== title) status.title = title;
  if (error && status.getAttribute('role') !== 'alert') status.setAttribute('role', 'alert');
  else if (!error && status.hasAttribute('role')) status.removeAttribute('role');
}
import { layerCountTitle } from './layerCountTitle.js';
