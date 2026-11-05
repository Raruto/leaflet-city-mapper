import { routeColor } from './routeColor.js';
import { carriage } from './carriage.js';

export function metroModel(index, properties) {
  const color = routeColor(properties), parts = [];
  for (let car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 15, 14, color));
  return parts;
}
