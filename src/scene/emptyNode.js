/** A fresh, empty scene-graph node. */
export function emptyNode() {
  return {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  children: [],
  visible: true,
  };
}
