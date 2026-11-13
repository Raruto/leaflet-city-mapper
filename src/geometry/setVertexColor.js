/**
 * Paints the vertices `[start, end)` of a mesh and marks its color buffer dirty.
 *
 * @param {Object} mesh Layer-created mesh with a color attribute.
 * @param {number} start Inclusive vertex index, not an offset into the RGB array.
 * @param {number} end Exclusive vertex index.
 * @param {Object} color sRGB {r,g,b}, typically from parseColor().
 */
export function setVertexColor(mesh, start, end, color) {
  const rgb = /* alloc */ [];
  let i;
  for (i = start; i < end; i++) {
    rgb[0] = color.r; rgb[1] = color.g; rgb[2] = color.b;
    mesh.geometry.attributes.color.data.set(rgb, i * 3);
  }
  mesh.geometry.attributes.color.needsUpdate = true;
}
