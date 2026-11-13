/**
 * Create a fresh, empty scene-graph node.
 *
 * @returns {Object} Node with identity transform and no children.
 */
export function emptyNode() {
  return /* alloc */ {
    position: /* alloc */ [0, 0, 0],
    rotation: /* alloc */ [0, 0, 0],
    scale: /* alloc */ [1, 1, 1],
    worldMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* alloc */ [],
    highlightRange: /* alloc */ [0, 0],
    visible: true,
  };
}
