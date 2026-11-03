import { car } from "./car.js";
import { boat } from "./white.js";

/**
 * `side`: default offset (metres) to the right of the lane centreline. `model(i)` gives the prisms of the i-th vehicle.
 * `lights`: night point lights in model space (see the night lighting grid), e.g. the pool cast by the headlights.
 */

export const vehicles = {
  car: { side: 1.8, model: car, lights: [{ position: [0, 1.2, -6], radius: 10, color: [1, 0.94, 0.82], flux: 800 }] },
  boat: { side: 0, model: boat, lights: [{ position: [0, 8, 4], radius: 30, color: [1, 0.8, 0.55], flux: 20000 }] },
};
