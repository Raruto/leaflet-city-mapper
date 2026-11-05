/** Compact repeated features only when reconstructed float32 positions compare equal. */
export function instanceAreaGeometry(context) {
  const { positions, normals, colors, featureFaces } = context;
  if (context.backend.options.nightLight || featureFaces.length < 2) return context;
  const vertices = featureFaces[0].vertexEnd;
  const length = vertices * 3;
  if (!vertices || positions.length !== length * featureFaces.length) return context;
  const origin = [Math.trunc(positions[0]), Math.trunc(positions[1]), Math.trunc(positions[2])];
  const template = new Float32Array(length);
  let i, instance, axis, face, start;
  for (i = 0; i < length; i++) template[i] = positions[i] - origin[i % 3];
  const offsets = new Float32Array(featureFaces.length * 4);
  for (instance = 0; instance < featureFaces.length; instance++) {
    face = featureFaces[instance];
    start = instance * length;
    if (face.vertexStart !== instance * vertices || face.vertexEnd !== (instance + 1) * vertices) return context;
    for (axis = 0; axis < 3; axis++) offsets[instance * 4 + axis] = origin[axis] + positions[start + axis] - positions[axis];
    offsets[instance * 4 + 3] = instance * vertices;
    for (i = 0; i < length; i++) {
      if (Math.fround(template[i] + offsets[instance * 4 + i % 3]) !== Math.fround(positions[start + i]) ||
          Math.fround(normals[i]) !== Math.fround(normals[start + i]) ||
          Math.fround(colors[i]) !== Math.fround(colors[start + i])) return context;
    }
  }
  return {
    positions: template, normals: normals.slice(0, length), colors: colors.slice(0, length),
    instanceOffsets: offsets,
  };
}
