import { box } from "../geometry/box.js";
import { trousers } from './trousers.js';
import { shirt } from './shirt.js';
import { skin } from './skin.js';
import { dark } from './dark.js';


export const parts = {
  body: [
    [box(-0.17, 0.17, -0.1, 0.1), 0.82, 0.95, trousers],
    [box(-0.19, 0.19, -0.11, 0.11), 0.95, 1.44, shirt],
    [box(-0.05, 0.05, -0.05, 0.05), 1.44, 1.5, skin],
    [box(-0.1, 0.1, -0.11, 0.1), 1.5, 1.72, skin],
    [box(-0.105, 0.105, -0.06, 0.115), 1.58, 1.77, dark],
    [box(-0.105, 0.105, -0.115, -0.06), 1.7, 1.77, dark],
  ],
  leg: [[box(-0.07, 0.07, -0.07, 0.07), -0.82, 0, trousers], [box(-0.07, 0.07, -0.17, 0.07), -0.9, -0.82, dark]],
  arm: [[box(-0.05, 0.05, -0.05, 0.05), -0.55, 0, shirt], [box(-0.045, 0.045, -0.045, 0.045), -0.66, -0.55, skin]],
};
