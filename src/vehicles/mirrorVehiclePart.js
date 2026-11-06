import { box } from "../geometry/box.js";

export function mirror(x0, x1, z0, z1, ...rest) {
  return /* alloc */ [
    /* alloc */ [box(x0, x1, z0, z1), ...rest],
    /* alloc */ [box(-x1, -x0, z0, z1), ...rest]
  ];
}
