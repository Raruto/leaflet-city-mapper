/** Compact repeated features only when reconstructed float32 positions compare equal. */
export function instanceAreaGeometry(context) {
  const { positions, normals, colors, featureFaces } = context;
  if (context.backend.options.nightLight || featureFaces.length < 2) return context;
  const vertices = featureFaces[0].vertexEnd;
  const length = vertices * 3;
  if (!vertices || positions.length !== length * featureFaces.length) return context;
  const originX = Math.trunc(positions[0]), originY = Math.trunc(positions[1]), originZ = Math.trunc(positions[2]);
  const template = /* alloc */ new Float32Array(length);
  let i, instance, face, start;
  for (i = 0; i < length; i++) template[i] = positions[i] - (i % 3 === 0 ? originX : i % 3 === 1 ? originY : originZ);
  const offsets = /* alloc */ new Float32Array(featureFaces.length * 4);
  for (instance = 0; instance < featureFaces.length; instance++) {
    face = featureFaces[instance];
    start = instance * length;
    if (face.vertexStart !== instance * vertices || face.vertexEnd !== (instance + 1) * vertices) return context;
    offsets[instance * 4] = originX + positions[start] - positions[0];
    offsets[instance * 4 + 1] = originY + positions[start + 1] - positions[1];
    offsets[instance * 4 + 2] = originZ + positions[start + 2] - positions[2];
    offsets[instance * 4 + 3] = instance * vertices;
    for (i = 0; i < length; i++) {
      if (Math.fround(template[i] + offsets[instance * 4 + i % 3]) !== Math.fround(positions[start + i]) ||
          Math.fround(normals[i]) !== Math.fround(normals[start + i]) ||
          Math.fround(colors[i]) !== Math.fround(colors[start + i])) return context;
    }
  }
  return /* alloc */ {
    positions: template, normals: normals.slice(0, length), colors: colors.slice(0, length),
    instanceOffsets: offsets,
  };
}
