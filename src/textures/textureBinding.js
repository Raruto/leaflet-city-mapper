/**
 * Reserve texture and sampler bindings and produce their WGSL declarations when enabled.
 *
 * @param {Array<Object>} bindings Program binding descriptions to extend.
 * @param {string} name Shader texture uniform name.
 * @param {boolean} enabled Whether the texture is used.
 *
 * @returns {string} WGSL declarations, or an empty string when disabled.
 */
export function textureBinding(bindings, name, enabled) {
  if (!enabled) return '';
  const current = 3 + bindings.length * 2;
  bindings.push(/* alloc */ { name, texture: current, sampler: current + 1 });
  return /* wgsl */ `@group(0) @binding(${current}) var ${name}: texture_2d<f32>;
      @group(0) @binding(${current + 1}) var ${name}Sampler: sampler;`;
}
