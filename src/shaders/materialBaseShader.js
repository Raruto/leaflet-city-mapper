/**
 * Generate fragment code for base color, alpha and optional roof texture.
 *
 * @param {Object} material Material settings.
 * @param {boolean} hasBase Whether a base texture is bound.
 * @param {boolean} hasRoof Whether a roof texture is bound.
 *
 * @returns {string} WGSL fragment code.
 */
export function materialBaseShader(material, hasBase, hasRoof) {
  return /* wgsl */ `
      var normal = normalize(input.normal) * select(-1.0, 1.0, frontFacing);
      let texel = ${hasBase ? 'textureSample(baseTexture, baseTextureSampler, input.uv)' : 'vec4<f32>(1.0)'};
      let alpha = u.material.z * texel.a;
      ${material.alphaMode === 'MASK' ? 'if (alpha < u.material.w) { discard; }' : ''}
      ${material.alphaMode === 'BLEND' ? 'if (alpha < 0.01) { discard; }' : ''}
      var base = ${material.vertexColors ? 'toLinear(min(input.color, vec3<f32>(1.0)))' : 'input.color'} *
        ${material.baseTexture?.srgb ? 'texel.rgb' : 'toLinear(texel.rgb)'};
      ${hasRoof ? /* wgsl */ `
        if (input.roof > 0.0 && all(input.roofUv >= vec2<f32>(0.0)) &&
          all(input.roofUv <= vec2<f32>(1.0))) {
          let roof = textureSampleLevel(roofTexture, roofTextureSampler, input.roofUv, 0.0);
          base = mix(base, toLinear(roof.rgb), roof.a * input.roof);
        }
      ` : ''}`;
}
