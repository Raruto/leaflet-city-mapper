/**
 * Convert a local ray hit to a world-space point and its distance from the original ray origin.
 *
 * @param {Object} ray Original world-space ray.
 * @param {Object} mesh Intersected mesh.
 * @param {number[]} origin Local ray origin.
 * @param {number[]} direction Local ray direction.
 * @param {number} closest Local ray distance to the hit.
 * @param {number} faceIndex Index of the hit triangle.
 *
 * @returns {Object} Hit containing the mesh, face index, world point and distance.
 */
export function worldHit(ray, mesh, origin, direction, closest, faceIndex) {
  const x = direction[0] * closest + origin[0];
  const y = direction[1] * closest + origin[1];
  const z = direction[2] * closest + origin[2];
  const matrix = mesh.worldMatrix;
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  const worldPoint = /* alloc */ [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
  ];
  return /* alloc */ {
    faceIndex,
    object: mesh,
    point: worldPoint,
    distance: Math.hypot(worldPoint[0] - ray.origin[0], worldPoint[1] - ray.origin[1], worldPoint[2] - ray.origin[2])
  };
}
