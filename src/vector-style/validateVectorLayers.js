/**
 * Validate that a vector style contains layers with string IDs and types.
 *
 * @param {*} layers Parsed style layers.
 *
 * @throws {Error} If layers is not an array.
 * @throws {Error} If a layer lacks a string ID or type.
 */
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
