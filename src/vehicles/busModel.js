import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './carriage.js';

export function busModel(index, properties) {
  return carriage(0, 12, routeColor(properties));
}
