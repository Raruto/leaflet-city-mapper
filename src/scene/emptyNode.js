/** A fresh, empty scene-graph node. */
export function emptyNode() {
  return /* allocation: required -- Each scene node owns independent mutable transforms and children. */ {
    position: /* allocation: required -- Keep node transforms independent. */ [0, 0, 0],
    rotation: /* allocation: required -- Keep node transforms independent. */ [0, 0, 0],
    scale: /* allocation: required -- Keep node transforms independent. */ [1, 1, 1],
    worldMatrix: /* allocation: required -- Keep each node's world transform independent. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* allocation: required -- Keep each node's child ownership independent. */ [],
    highlightRange: /* allocation: required -- Keep each mesh's highlight range independent. */ [0, 0],
    visible: true,
  };
}
