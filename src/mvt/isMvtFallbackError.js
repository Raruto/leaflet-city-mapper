/**
 * Identify triangulation failures eligible for MVT tessellation fallback.
 *
 * @param {Error} error Triangulation error.
 *
 * @returns {boolean} Whether fallback is allowed.
 */
export function isMvtFallbackError(error) {
  return error.message === 'Polygon triangulation area mismatch' ||
    error.message === 'Degenerate polygon ring' ||
    error.message === 'Unable to triangulate polygon: invalid or self-intersecting rings' ||
    error.message === 'Unable to connect polygon hole';
}
