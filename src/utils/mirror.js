import { box } from "./box";

export const mirror = (x0, x1, z0, z1, ...rest) => [[box(x0, x1, z0, z1), ...rest], [box(-x1, -x0, z0, z1), ...rest]];
