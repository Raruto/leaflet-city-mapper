/**
 * Generate optional native-stroke position and normal vertex snippets.
 *
 * @param {Object} material Material settings.
 *
 * @returns {Object} WGSL position and normal snippets.
 */
export function nativeStrokeShader(material) {
  return /* alloc */ {
    position: material.nativeStroke ? 'position = input.normal + (input.position - input.normal) * u.nativeStroke.x;' : '',
    normal: material.nativeStroke ? 'let sourceNormal = vec3<f32>(0.0, 1.0, 0.0);' : 'let sourceNormal = input.normal;',
  };
}
