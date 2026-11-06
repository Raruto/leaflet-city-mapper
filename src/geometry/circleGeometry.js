import { L } from '../globals/L.js';
import { disk } from './disk.js';
import { circleAt } from './circleAt.js';
import { line } from './line.js';
import { triangle } from './appendNativeTriangle.js';

export function circleGeometry(source, context) {
  const { map, point, fill, stroke, options, dash, width } = context;
  const center = map.project(source.getLatLng());
  let radius = source.getRadius(), radiusY = radius, index, i;
  if (source instanceof L.Circle) {
    source._project();
    const projected = source._point.add(map.getPixelOrigin());
    center.x = projected.x;
    center.y = projected.y;
    radius = source._radius;
    radiusY = source._radiusY || radius;
  }
  if (options.fill) disk(point, center, radius, fill, radiusY);
  const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(Math.max(radius, radiusY)))));
  if (dash.length) {
    const points = /* alloc */ [];
    for (index = 0; index < count; index++) points.push(circleAt(center, radius, radiusY, count, index));
    line(context, points, true);
  }
  else if (options.stroke && width > 0) {
    for (i = 0; i < count; i++) {
      triangle(point, stroke, circleAt(center, radius, radiusY, count, i, width / 2),
        circleAt(center, radius, radiusY, count, i, -width / 2), circleAt(center, radius, radiusY, count, i + 1, width / 2));
      triangle(point, stroke, circleAt(center, radius, radiusY, count, i + 1, width / 2),
        circleAt(center, radius, radiusY, count, i, -width / 2), circleAt(center, radius, radiusY, count, i + 1, -width / 2));
    }
  }
}
