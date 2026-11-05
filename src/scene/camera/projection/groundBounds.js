import { pointOf } from './pointOf.js';
import { project } from './project.js';

export function groundBounds(map, padding = [0, 0]) {
  const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
  const corners = [[min.x, min.y], [max.x, min.y], [min.x, max.y], [max.x, max.y]];
  const points = [];
  for (const point of corners) points.push(project(map, point, true, true));
  return new L.Bounds(points);
}
