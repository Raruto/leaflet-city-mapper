export function isMvtFallbackError(error) {
  return error.message === 'Polygon triangulation area mismatch' ||
    error.message === 'Degenerate polygon ring' ||
    error.message === 'Unable to triangulate polygon: invalid or self-intersecting rings' ||
    error.message === 'Unable to connect polygon hole';
}
