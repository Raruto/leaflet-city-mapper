export function nativeStrokeShader(material) {
  return /* alloc */ {
    position: material.nativeStroke ? 'position = input.normal + (input.position - input.normal) * u.nativeStroke.x;' : '',
    normal: material.nativeStroke ? 'let sourceNormal = vec3<f32>(0.0, 1.0, 0.0);' : 'let sourceNormal = input.normal;',
  };
}
