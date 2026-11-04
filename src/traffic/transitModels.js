import { box } from '../geometry/box.js';
import { glass, tyre } from './glass.js';
import { white } from './white.js';
import { headlight } from './headlight.js';
import { taillight } from './taillight.js';

function routeColor(properties) {
  const color = properties?.route_color;
  if (!/^[\da-f]{6}$/i.test(color)) return [0.1, 0.55, 0.65];
  const value = Number.parseInt(color, 16);
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}

function carriage(center, length, color) {
  const front = center - length / 2, rear = center + length / 2;
  return [
    [box(-1.25, 1.25, front, rear), 0.45, 1.25, color],
    [box(-1.2, 1.2, front + 0.15, rear - 0.15), 1.25, 2.65, glass],
    [box(-1.25, 1.25, front, rear), 2.65, 3.1, white],
    [box(-1.15, -0.85, front + 1, front + 2), 0, 0.7, tyre],
    [box(0.85, 1.15, rear - 2, rear - 1), 0, 0.7, tyre],
    [box(-0.9, 0.9, front - 0.03, front), 0.8, 1.05, headlight],
    [box(-0.9, 0.9, rear, rear + 0.03), 0.8, 1.05, taillight],
  ];
}

export function busModel(index, properties) {
  return carriage(0, 12, routeColor(properties));
}

export function tramModel(index, properties) {
  const color = routeColor(properties), parts = [];
  for (let car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 6.5, 6, color));
  return parts;
}

export function metroModel(index, properties) {
  const color = routeColor(properties), parts = [];
  for (let car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 15, 14, color));
  return parts;
}
