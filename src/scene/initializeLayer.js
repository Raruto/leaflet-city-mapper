import { sceneByLayer } from '../globals/sceneByLayer.js';


export function initializeLayer(task) {
  const { layer, ready } = task;
  try {
    if (task.error) throw task.error;
    const map = layer._map;
    map?.removeLayer(layer);
    delete sceneByLayer.get(layer).kind;
    task.initialize(layer, task.settings);
    map?.addLayer(layer);
    return sceneByLayer.get(layer).ready === ready ? layer : sceneByLayer.get(layer).ready;
  } catch (error) {
    layer.fire('error', /* allocation: required -- Preserve each failed initialization as an independent event. */ { error });
    throw error;
  }
}
