import { geometryEmpty } from '../globals/geometryEmpty.js';
import { materialFor } from '../materials/modelMaterialFor.js';

/**
 * Create the model construction context and prepare its materials.
 *
 * @param {L.Layer} layer Rendering backend for the model.
 * @param {Object} description Decoded glTF document.
 * @param {Array} images Loaded model images.
 *
 * @returns {Object} Context containing materials, textures and tracked resources.
 */
export function createModelContext(layer, description, images) {
  const context = /* alloc */ {
    backend: layer, description, images,
    textures: /* alloc */ new Map(),
    materials: /* alloc */ [],
    active: /* alloc */ new Set(),
    resources: /* alloc */ [],
  };
  let material;
  for (material of description.materials || geometryEmpty) context.materials.push(materialFor(context, material));
  return context;
}
