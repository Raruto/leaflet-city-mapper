import { ring } from './treeRing.js';
import { ringDirections } from './constants/ringDirections.js';

export function surface(point, addTriangle, lowRadius, low, highRadius, high, color) {
  const lower = ring(point, lowRadius), upper = ring(point, highRadius);
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    const slope = (lowRadius - highRadius) / (high - low);
    const length = Math.hypot(1, slope);
    const { nx, nz } = ringDirections[i];
    const ny = slope / length;
    const normalX = nx / length, normalZ = nz / length;
    if (lowRadius) addTriangle(lower[i], low, lower[next], low, upper[next], high, normalX, ny, normalZ, color);
    if (highRadius) addTriangle(lower[i], low, upper[next], high, upper[i], high, normalX, ny, normalZ, color);
  }
}
