/** Compose parent*local matrices; a node.matrix overrides its position/rotation/scale. */

export function updateWorldMatrix(node) {
  const parent = node.parent;
  const parentVersion = parent?._worldMatrixVersion || 0;
  const matrixMode = Boolean(node.matrix);
  let changed = node._worldParent !== parent || node._parentWorldVersion !== parentVersion ||
    node._worldMatrixMode !== matrixMode;
  if (node.matrix) {
    const state = node._matrixState ||= new Float64Array(16);
    for (let i = 0; i < 16; i++) {
      if (state[i] !== node.matrix[i]) changed = true;
      state[i] = node.matrix[i];
    }
  } else {
    const state = node._transformState ||= new Float64Array(9);
    for (let i = 0; i < 9; i++) {
      const value = i < 3 ? node.position[i] : i < 6 ? node.rotation[i - 3] : node.scale[i - 6];
      if (state[i] !== value) changed = true;
      state[i] = value;
    }
  }
  if (!changed) {
    for (const child of node.children) updateWorldMatrix(child);
    return;
  }
  let local;
  if (node.matrix) local = node.matrix;
  else {
    const degrees = 180 / Math.PI;
    const matrix = new DOMMatrix().translate(...node.position);
    // Node rotations use YXZ, as did the previous renderer.
    matrix.rotateAxisAngleSelf(0, 1, 0, node.rotation[1] * degrees);
    matrix.rotateAxisAngleSelf(1, 0, 0, node.rotation[0] * degrees);
    matrix.rotateAxisAngleSelf(0, 0, 1, node.rotation[2] * degrees);
    local = matrix.scale(...node.scale).toFloat64Array();
  }
  const world = parent
    ? new DOMMatrix(parent.worldMatrix).multiply(new DOMMatrix(local)).toFloat64Array()
    : local;
  for (let i = 0; i < 16; i++) node.worldMatrix[i] = world[i];
  node._worldParent = parent;
  node._parentWorldVersion = parentVersion;
  node._worldMatrixMode = matrixMode;
  node._worldMatrixVersion = (node._worldMatrixVersion || 0) + 1;
  for (const child of node.children) updateWorldMatrix(child);
}
