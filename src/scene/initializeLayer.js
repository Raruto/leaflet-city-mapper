import { sceneByLayer } from '../globals/sceneByLayer.js';
import { reportError } from './reportError.js';


export function initializeLayer(task) {
  const { layer, ready } = task;
  if (task.error) {
    reportError(layer, task.error);
    return Promise.reject(task.error);
  }
  try {
    const map = layer._map;
    map?.removeLayer(layer);
    delete sceneByLayer.get(layer).kind;
    task.initialize(layer, task.settings);
    map?.addLayer(layer);
    return sceneByLayer.get(layer).ready === ready ? layer : sceneByLayer.get(layer).ready;
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
    throw error;
  }
}
