import { degrees } from '../globals/degrees.js';

/**
 * Reuse the node's local matrix to compose translation, YXZ rotation and scale.
 *
 * @param {Object} node Scene node with position, rotation and scale.
 *
 * @returns {DOMMatrix} The composed local matrix.
 */
export function composeLocalTransform(node) {
  const matrix = node._localTransform ||= /* alloc */ new DOMMatrix();
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
  return matrix;
}
