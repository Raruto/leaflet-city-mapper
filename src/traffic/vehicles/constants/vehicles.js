import { carModel } from '../carModel.js';
import { boatModel } from '../boatModel.js';
import { busModel } from '../busModel.js';
import { tramModel } from '../tramModel.js';
import { metroModel } from '../metroModel.js';
import { bicycleModel } from '../bicycleModel.js';
import { pedestrianModel } from '../pedestrianModel.js';

/**
 * `side`: default offset (metres) to the right of the lane centreline. `model(i)` gives the prisms of the i-th vehicle.
 * `lights`: night point lights in model space (see the night lighting grid), e.g. the pool cast by the headlights.
 */
export const vehicles = {
  bicycle: { side: 0.4, model: bicycleModel },
  pedestrian: { side: 0.3, model: pedestrianModel },
  bus: { side: 1.5, model: busModel },
  tram: { side: 0, model: tramModel },
  metro: { side: 0, model: metroModel },
  car: {
    side: 1.8,
    model: carModel,
    lights: [{
      position: [0, 1.2, -6],
      radius: 10,
      color: [1, 0.94, 0.82],
      flux: 800
    }]
  },
  // Panoramic river cruiser, about 60 × 11 m: glass saloon, open upper deck with benches, wheelhouse forward.
  boat: {
    side: 0,
    model: boatModel,
    lights: [{
      position: [0, 8, 4],
      radius: 30,
      color: [1, 0.8, 0.55],
      flux: 20000
    }]
  },
};
