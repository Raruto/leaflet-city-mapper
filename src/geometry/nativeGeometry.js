import { L } from '../globals/L.js';
import { triangulate } from '../triangulation/triangulate.js';
import { disk } from './disk.js';
import { circleAt } from './circleAt.js';
import { line } from './line.js';
import { visit } from './visit.js';
import { triangle } from './nativeTriangle.js';

/** Leaflet paths become flat triangles; pixel-sized strokes are rebuilt on zoom. */
export function nativeGeometry(source, map, point) {
  const fill = /* allocation: required -- Each native layer rebuild retains independent fill data. */ [];
  const stroke = /* allocation: required -- Each native layer rebuild retains independent stroke data. */ [];
  const options = source.options;
  const width = Number(options.weight) || 0;
  const values = Array.isArray(options.dashArray) ? options.dashArray :
    String(options.dashArray || '').trim().split(/[ ,]+/);
  const dash = /* allocation: required -- Dash normalization stays private across reentrant projection callbacks. */ [];
  let value, index, i;
  for (value of values) dash.push(Number(value));
  let allZero = true;
  for (value of dash) {
    if (!Number.isFinite(value) || value < 0) throw /* allocation: required -- Validation errors retain their own message and stack. */ new Error('Invalid Leaflet dashArray');
    if (value !== 0) allZero = false;
  }
  if (allZero) dash.length = 0;
  if (dash.length % 2) dash.push(...dash);
  const context = /* allocation: required -- Geometry traversal and projection callbacks need an isolated operation context. */ { fill, stroke, options, width, dash, point, map };
  if (source instanceof L.CircleMarker) {
    const center = map.project(source.getLatLng());
    let radius = source.getRadius(), radiusY = radius;
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
      const points = /* allocation: required -- The dashed circle path stays private across reentrant projection callbacks. */ [];
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
  } else {
    const closed = source instanceof L.Polygon;
    visit(context, source.getLatLngs(), closed);
  }
  return /* allocation: required -- The caller retains independent native layer attribute data. */ { fill, stroke };
}
