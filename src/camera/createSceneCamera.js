/** Perspective camera state: fov in degrees, near/far in scene metres. */
export function createSceneCamera() {
  return /* alloc */ {
    position: /* alloc */ [0, 0, 0],
    up: /* alloc */ [0, 1, 0],
    target: /* alloc */ [0, 0, 0],
    x: /* alloc */ [0, 0, 0],
    y: /* alloc */ [0, 0, 0],
    z: /* alloc */ [0, 0, 0],
    viewMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    projectionMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    projectionViewMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    viewTransform: /* alloc */ new DOMMatrix(),
    projectionTransform: /* alloc */ new DOMMatrix(),
    projectionViewTransform: /* alloc */ new DOMMatrix(),
    fov: 45,
    aspect: 1,
    near: 0.1,
    far: 10000,
  };
}
