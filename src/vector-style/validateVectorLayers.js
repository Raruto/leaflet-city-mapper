export function validateVectorLayers(layers) {
  let i = 0, layer = null;
  if (!Array.isArray(layers)) throw /* alloc */ new Error('Invalid vector style layers');
  for (i = 0; i < layers.length; i++) {
    layer = layers[i];
    if (!layer || typeof layer.id !== 'string' || typeof layer.type !== 'string') {
      throw /* alloc */ new Error('Invalid vector style layers');
    }
  }
}
