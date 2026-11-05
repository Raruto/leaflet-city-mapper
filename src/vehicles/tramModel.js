import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './carriage.js';

export function tramModel(index, properties) {
  const color = routeColor(properties), parts = [];
  let car;
  for (car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 6.5, 6, color));
  return parts;
}
