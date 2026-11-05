import { box } from "../geometry/box.js";

export function mirror(x0, x1, z0, z1, ...rest) {
  return /* allocation: required -- The caller retains an independent mirrored part pair. */ [
    /* allocation: required -- The positive-side part retains its own footprint and dimensions. */ [box(x0, x1, z0, z1), ...rest],
    /* allocation: required -- The negative-side part retains its own footprint and dimensions. */ [box(-x1, -x0, z0, z1), ...rest]
  ];
}
