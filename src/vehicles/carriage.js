import { box } from '../geometry/box.js';
import { glass } from '../constants/glass.js';
import { tyre } from '../constants/tyre.js';
import { white } from '../constants/white.js';
import { headlight } from '../constants/headlight.js';
import { taillight } from '../constants/taillight.js';

export function carriage(center, length, color) {
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
