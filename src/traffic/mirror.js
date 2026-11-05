import { box } from "../geometry/box.js";

export function mirror(x0, x1, z0, z1, ...rest) {
  return [
    [box(x0, x1, z0, z1), ...rest],
    [box(-x1, -x0, z0, z1), ...rest]
  ];
}
