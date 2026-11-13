/**
 * Store the maximum distance between stroke vertices and their anchors.
 *
 * @param {Object} mesh Native stroke mesh.
 */
export function updateNativeStrokeRadius(mesh) {
  const attributes = mesh.geometry.attributes, positions = attributes.position.data, anchors = attributes.normal.data;
  let i, radius = 0;
  for (i = 0; i < positions.length; i += 3) {
    radius = Math.max(radius, Math.hypot(positions[i] - anchors[i],
      positions[i + 1] - anchors[i + 1], positions[i + 2] - anchors[i + 2]));
  }
  mesh.geometry.nativeStrokeRadius = radius;
}
