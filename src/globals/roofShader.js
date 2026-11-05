export const roofShader = {
  code: /* wgsl */`
      @group(0) @binding(0) var source: texture_2d<f32>;
      @group(0) @binding(1) var sourceSampler: sampler;
      @group(0) @binding(2) var<uniform> opacity: f32;
      struct Varyings { @builtin(position) position: vec4f, @location(0) uv: vec2f };
      @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Varyings {
        let uv = vec2f(f32(index & 1u), f32(index >> 1u));
        return Varyings(vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0), uv);
      }
      @fragment fn fragmentMain(input: Varyings) -> @location(0) vec4f {
        let color = textureSample(source, sourceSampler, input.uv);
        return vec4f(color.rgb, color.a * opacity);
      }
    `
};
