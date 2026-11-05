import { pluginState } from '../core/pluginState.js';
export function initializeLayer(task) {
  const { layer, ready } = task;
  try {
    if (task.error) throw task.error;
    const map = layer._map;
    map?.removeLayer(layer);
    delete pluginState(layer).onAdd;
    delete pluginState(layer).onRemove;
    task.initialize(layer, task.settings);
    map?.addLayer(layer);
    return pluginState(layer).ready === ready ? layer : pluginState(layer).ready;
  } catch (error) {
    layer.fire('error', /* allocation: required -- Preserve each failed initialization as an independent event. */ { error });
    throw error;
  }
}
