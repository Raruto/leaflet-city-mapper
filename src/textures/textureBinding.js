export function textureBinding(bindings, name, enabled) {
  if (!enabled) return '';
  const current = 3 + bindings.length * 2;
  bindings.push(/* alloc */ { name, texture: current, sampler: current + 1 });
  return /* wgsl */ `@group(0) @binding(${current}) var ${name}: texture_2d<f32>;
      @group(0) @binding(${current + 1}) var ${name}Sampler: sampler;`;
}
