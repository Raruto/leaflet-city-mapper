/**
 * Paints the vertices `[start, end)` of a mesh and marks its color buffer dirty.
 * @param {Object} mesh Layer-created mesh with a color attribute.
 * @param {number} start Inclusive vertex index, not an offset into the RGB array.
 * @param {number} end Exclusive vertex index.
 * @param {Object} color sRGB {r,g,b}, typically from parseColor().
 */

export function setVertexColor(mesh, start, end, color) {
  for (let i = start; i < end; i++) {
    mesh.geometry.attributes.color.data.set([color.r, color.g, color.b], i * 3);
  }
  mesh.geometry.attributes.color.needsUpdate = true;
}
