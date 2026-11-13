/**
 * Compute a simplification tolerance of about 0.7 screen pixels in tile units.
 *
 * @param {Object} job Vector tile preparation job.
 * @param {Object} layer Decoded source layer.
 *
 * @returns {number} Tolerance in tile units.
 */
export function vectorTolerance(job, layer) {
  return layer.extent / 256 / 2 ** Math.max(-1, job.mapZoom - job.coords.z) * 0.7;
}
