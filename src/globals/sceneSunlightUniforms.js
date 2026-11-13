/**
 * Initial sunlight uniforms with an identity shadow matrix.
 *
 * @type {Float32Array}
 */
export const sceneSunlightUniforms = new Float32Array(20);
sceneSunlightUniforms[0] = sceneSunlightUniforms[5] =
  sceneSunlightUniforms[10] = sceneSunlightUniforms[15] = 1;
