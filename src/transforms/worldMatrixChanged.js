/**
 * Compare and cache the node's explicit matrix or position, rotation and scale components.
 *
 * @param {Object} node Scene node with cached transform state.
 * @param {boolean} changed Whether another change was already detected.
 *
 * @returns {boolean} Whether the transform or another input changed.
 */
export function worldMatrixChanged(node, changed) {
  let i, value;
  if (node.matrix) {
    const state = node._matrixState ||= /* alloc */ new Float64Array(16);
    for (i = 0; i < 16; i++) {
      if (state[i] !== node.matrix[i]) changed = true;
      state[i] = node.matrix[i];
    }
  } else {
    const state = node._transformState ||= /* alloc */ new Float64Array(9);
    for (i = 0; i < 9; i++) {
      value = i < 3 ? node.position[i] : i < 6 ? node.rotation[i - 3] : node.scale[i - 6];
      if (state[i] !== value) changed = true;
      state[i] = value;
    }
  }
  return changed;
}
