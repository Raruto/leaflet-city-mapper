/** Compose parent*local matrices; a node.matrix overrides its position/rotation/scale. */

export function updateWorldMatrix(node) {
  const parent = node.parent;
  const parentVersion = parent?._worldMatrixVersion || 0;
  const matrixMode = Boolean(node.matrix);
  let changed = node._worldParent !== parent || node._parentWorldVersion !== parentVersion ||
    node._worldMatrixMode !== matrixMode;
  let i, value, child;
  if (node.matrix) {
    const state = node._matrixState ||= /* allocation: required -- Cache the source matrix version per scene node. */ new Float64Array(16);
    for (i = 0; i < 16; i++) {
      if (state[i] !== node.matrix[i]) changed = true;
      state[i] = node.matrix[i];
    }
  } else {
    const state = node._transformState ||= /* allocation: required -- Cache transform inputs independently per scene node. */ new Float64Array(9);
    for (i = 0; i < 9; i++) {
      value = i < 3 ? node.position[i] : i < 6 ? node.rotation[i - 3] : node.scale[i - 6];
      if (state[i] !== value) changed = true;
      state[i] = value;
    }
  }
  if (!changed) {
    for (child of node.children) updateWorldMatrix(child);
    return;
  }
  let local, world;
  if (node.matrix) local = node.matrix;
  else {
    const degrees = 180 / Math.PI;
    const matrix = node._localTransform ||= /* allocation: required -- Retain one transform scratch matrix per node. */ new DOMMatrix();
    matrix.m11 = 1, matrix.m12 = 0, matrix.m13 = 0, matrix.m14 = 0;
    matrix.m21 = 0, matrix.m22 = 1, matrix.m23 = 0, matrix.m24 = 0;
    matrix.m31 = 0, matrix.m32 = 0, matrix.m33 = 1, matrix.m34 = 0;
    matrix.m41 = 0, matrix.m42 = 0, matrix.m43 = 0, matrix.m44 = 1;
    matrix.translateSelf(node.position[0], node.position[1], node.position[2]);
    // Node rotations use YXZ, as did the previous renderer.
    matrix.rotateAxisAngleSelf(0, 1, 0, node.rotation[1] * degrees);
    matrix.rotateAxisAngleSelf(1, 0, 0, node.rotation[0] * degrees);
    matrix.rotateAxisAngleSelf(0, 0, 1, node.rotation[2] * degrees);
    matrix.scaleSelf(node.scale[0], node.scale[1], node.scale[2]);
    local = matrix;
  }
  world = node._worldTransform ||= /* allocation: required -- Retain one composed transform scratch matrix per node. */ new DOMMatrix();
  if (local instanceof DOMMatrix) {
    world.m11 = local.m11, world.m12 = local.m12, world.m13 = local.m13, world.m14 = local.m14;
    world.m21 = local.m21, world.m22 = local.m22, world.m23 = local.m23, world.m24 = local.m24;
    world.m31 = local.m31, world.m32 = local.m32, world.m33 = local.m33, world.m34 = local.m34;
    world.m41 = local.m41, world.m42 = local.m42, world.m43 = local.m43, world.m44 = local.m44;
  } else {
    world.m11 = local[0], world.m12 = local[1], world.m13 = local[2], world.m14 = local[3];
    world.m21 = local[4], world.m22 = local[5], world.m23 = local[6], world.m24 = local[7];
    world.m31 = local[8], world.m32 = local[9], world.m33 = local[10], world.m34 = local[11];
    world.m41 = local[12], world.m42 = local[13], world.m43 = local[14], world.m44 = local[15];
  }
  if (parent) world.preMultiplySelf(parent._worldTransform);
  node.worldMatrix[0] = world.m11, node.worldMatrix[1] = world.m12, node.worldMatrix[2] = world.m13, node.worldMatrix[3] = world.m14;
  node.worldMatrix[4] = world.m21, node.worldMatrix[5] = world.m22, node.worldMatrix[6] = world.m23, node.worldMatrix[7] = world.m24;
  node.worldMatrix[8] = world.m31, node.worldMatrix[9] = world.m32, node.worldMatrix[10] = world.m33, node.worldMatrix[11] = world.m34;
  node.worldMatrix[12] = world.m41, node.worldMatrix[13] = world.m42, node.worldMatrix[14] = world.m43, node.worldMatrix[15] = world.m44;
  node._worldParent = parent;
  node._parentWorldVersion = parentVersion;
  node._worldMatrixMode = matrixMode;
  node._worldMatrixVersion = (node._worldMatrixVersion || 0) + 1;
  for (child of node.children) updateWorldMatrix(child);
}
