/**
 * Validate and write native or raster cutout settings into the mesh uniform buffer.
 *
 * @param {Object} renderer Renderer containing uniform data and pixel ratio.
 * @param {Object} mesh Mesh with optional native or raster source.
 * @param {number} base Starting index in the uniform array.
 *
 * @throws {Error} If cutout coordinates or radius are invalid.
 */
export function prepareMeshCutout(renderer, mesh, base) {
  const data = renderer.uniformData;
  const cutout = (mesh._nativeSource || mesh._rasterSource)?.options.cutout;
  if (cutout && (!Number.isFinite(cutout.x) || !Number.isFinite(cutout.y) ||
      !Number.isFinite(cutout.radius) || cutout.radius < 0)) {
    throw /* alloc */ new Error('cutout requires finite x, y and a non-negative radius in CSS pixels');
  }
  data[base + 36] = (cutout?.x ?? 0) * renderer.dpr;
  data[base + 37] = (cutout?.y ?? 0) * renderer.dpr;
  data[base + 38] = (cutout?.radius ?? 0) * renderer.dpr;
  data[base + 39] = cutout?.outside ? 1 : 0;
}
