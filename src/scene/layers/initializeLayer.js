export function initializeLayer(task) {
  const { layer, ready } = task;
  try {
    if (task.error) throw task.error;
    const map = layer._map;
    map?.removeLayer(layer);
    delete layer.onAdd;
    delete layer.onRemove;
    task.initialize(layer, task.settings);
    map?.addLayer(layer);
    return layer.ready === ready ? layer : layer.ready;
  } catch (error) {
    layer.fire('error', { error });
    throw error;
  }
}
