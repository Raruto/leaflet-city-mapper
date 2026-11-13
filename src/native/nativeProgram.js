import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { nativeProgramsByRenderer } from '../weakmaps/nativeProgramsByRenderer.js';
import { createProgram } from '../materials/createProgram.js';
import { createProgramUniforms } from '../materials/createProgramUniforms.js';

/**
 * Create a native material program from a renderer-local cached template.
 *
 * @param {Object} layer Backend layer.
 * @param {Object} material Material properties.
 *
 * @returns {Object} Program with material-specific uniforms.
 */
export function nativeProgram(layer, material) {
  const renderer = rendererByLayer.get(layer);
  let programs = nativeProgramsByRenderer.get(renderer);
  if (!programs) {
    programs = /* alloc */ new Map();
    nativeProgramsByRenderer.set(renderer, programs);
  }
  const key = `${Boolean(material.baseTexture)}:${Boolean(material.nativeStroke)}:${Boolean(material.depthWrite)}`;
  let template = programs.get(key);
  if (!template) {
    template = createProgram(layer, /* alloc */ { doubleSided: true, ...material });
    programs.set(key, template);
  }
  return /* alloc */ { ...template, uniforms: createProgramUniforms(material), _layerMaterial: material };
}
