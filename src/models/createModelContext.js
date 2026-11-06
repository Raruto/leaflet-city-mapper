import { geometryEmpty } from '../globals/geometryEmpty.js';
import { materialFor } from '../materials/modelMaterialFor.js';

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
