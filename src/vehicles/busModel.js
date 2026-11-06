import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './buildCarriage.js';

export function busModel(index, properties) {
  return carriage(0, 12, routeColor(properties));
}
