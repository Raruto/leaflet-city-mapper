export function renderLayerCount(scene, count, pending, error) {
  const status = scene._countStatus;
  if (scene.modelUrl) count = scene.model ? 1 : 0;
  const loading = pending || (scene.modelUrl ? !scene.model : !scene.header && !scene._geojson);
  const formatted = count.toLocaleString('en-US');
  const text = error ? 'Error' : `${formatted}${loading ? '…' : ''}`;
  const title = layerCountTitle(scene, formatted, pending, error);
  if (status.textContent !== text) status.textContent = text;
  if (status.title !== title) status.title = title;
  if (error && status.getAttribute('role') !== 'alert') status.setAttribute('role', 'alert');
  else if (!error && status.hasAttribute('role')) status.removeAttribute('role');
}
import { layerCountTitle } from './layerCountTitle.js';
