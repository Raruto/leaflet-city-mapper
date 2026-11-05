import { routeColor } from '../routes/routeColor.js';
import { carriage } from './carriage.js';

export function tramModel(index, properties) {
  const color = routeColor(properties), parts = [];
  for (let car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 6.5, 6, color));
  return parts;
}
