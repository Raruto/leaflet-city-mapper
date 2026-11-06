import { worldMatrixChanged } from './worldMatrixChanged.js';
import { composeLocalTransform } from './composeLocalTransform.js';

/** Compose parent*local matrices; a node.matrix overrides its position/rotation/scale. */

export function updateWorldMatrix(node) {
  const parent = node.parent;
  const parentVersion = parent?._worldMatrixVersion || 0;
  const matrixMode = Boolean(node.matrix);
  let changed = node._worldParent !== parent || node._parentWorldVersion !== parentVersion ||
    node._worldMatrixMode !== matrixMode;
  let child;
  changed = worldMatrixChanged(node, changed);
  if (!changed) {
    for (child of node.children) updateWorldMatrix(child);
    return;
  }
  let local, world;
  if (node.matrix) local = node.matrix;
  else local = composeLocalTransform(node);
  world = node._worldTransform ||= /* alloc */ new DOMMatrix();
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
