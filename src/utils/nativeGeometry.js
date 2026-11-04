import { triangulate } from './triangulate.js';

/** Leaflet paths become flat triangles; pixel-sized strokes are rebuilt on zoom. */
export function nativeGeometry(source, map, point) {
  const fill = [], stroke = [], options = source.options;
  const triangle = (target, a, b, c) => target.push(...point(a), ...point(b), ...point(c));
  const disk = (center, radius, target, radiusY = radius) => {
    if (!(radius > 0) || !(radiusY > 0)) return;
    const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(radius))));
    for (let i = 0; i < count; i++) {
      const at = index => new L.Point(center.x + radius * Math.cos(index * 2 * Math.PI / count),
        center.y + radiusY * Math.sin(index * 2 * Math.PI / count));
      triangle(target, center, at(i), at(i + 1));
    }
  };
  const width = Number(options.weight) || 0;
  const dash = (Array.isArray(options.dashArray) ? options.dashArray :
    String(options.dashArray || '').trim().split(/[ ,]+/)).map(Number);
  if (dash.some(value => !Number.isFinite(value) || value < 0)) throw new Error('Invalid Leaflet dashArray');
  if (dash.every(value => value === 0)) dash.length = 0;
  if (dash.length % 2) dash.push(...dash);
  const line = (points, closed) => {
    if (!options.stroke || width <= 0 || points.length < 2) return;
    const radius = width / 2;
    const segment = (a, b, startCap, endCap) => {
      const length = a.distanceTo(b);
      if (!length) return;
      const direction = b.subtract(a).divideBy(length);
      const normal = new L.Point(-direction.y * radius, direction.x * radius);
      if (options.lineCap === 'square') {
        if (startCap) a = a.subtract(direction.multiplyBy(radius));
        if (endCap) b = b.add(direction.multiplyBy(radius));
      }
      triangle(stroke, a.add(normal), a.subtract(normal), b.add(normal));
      triangle(stroke, b.add(normal), a.subtract(normal), b.subtract(normal));
      if (options.lineCap === 'round') {
        if (startCap) disk(a, radius, stroke);
        if (endCap) disk(b, radius, stroke);
      }
    };
    let distance = Number(options.dashOffset) || 0;
    const period = dash.reduce((sum, value) => sum + value, 0);
    for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
      const a = points[i], b = points[(i + 1) % points.length], length = a.distanceTo(b);
      if (!dash.length) {
        segment(a, b, !closed && i === 0, !closed && i === points.length - 2);
        if (closed || i > 0) {
          if (options.lineJoin === 'round') disk(a, radius, stroke);
          else {
            const previous = a.subtract(points[(i + points.length - 1) % points.length]);
            const previousLength = Math.hypot(previous.x, previous.y);
            if (previousLength && length) {
              const incoming = previous.divideBy(previousLength);
              const outgoing = b.subtract(a).divideBy(length);
              const side = incoming.x * outgoing.y - incoming.y * outgoing.x > 0 ? -1 : 1;
              const n1 = new L.Point(-incoming.y * side, incoming.x * side);
              const n2 = new L.Point(-outgoing.y * side, outgoing.x * side);
              const from = a.add(n1.multiplyBy(radius)), to = a.add(n2.multiplyBy(radius));
              const denominator = 1 + n1.x * n2.x + n1.y * n2.y;
              const miter = denominator > 0 ? n1.add(n2).multiplyBy(radius / denominator) : null;
              triangle(stroke, from, a, to);
              if (options.lineJoin === 'miter' && miter && Math.hypot(miter.x, miter.y) <= radius * 4) {
                triangle(stroke, from, a.add(miter), to);
              }
            }
          }
        }
      } else {
        let offset = 0;
        while (offset < length) {
          let phase = ((distance + offset) % period + period) % period, index = 0;
          while (phase >= dash[index]) phase -= dash[index++];
          const end = Math.min(length, offset + dash[index] - phase);
          if (index % 2 === 0) {
            const delta = b.subtract(a).divideBy(length);
            segment(a.add(delta.multiplyBy(offset)), a.add(delta.multiplyBy(end)), true, true);
          }
          offset = end;
        }
      }
      distance += length;
    }
  };
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
    if (options.fill) disk(center, radius, fill, radiusY);
    const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(Math.max(radius, radiusY)))));
    const at = (index, offset = 0) => {
      const angle = index * Math.PI * 2 / count;
      return new L.Point(center.x + Math.max(0, radius + offset) * Math.cos(angle),
        center.y + Math.max(0, radiusY + offset) * Math.sin(angle));
    };
    if (dash.length) line(Array.from({ length: count }, (_, index) => at(index)), true);
    else if (options.stroke && width > 0) {
      for (let i = 0; i < count; i++) {
        triangle(stroke, at(i, width / 2), at(i, -width / 2), at(i + 1, width / 2));
        triangle(stroke, at(i + 1, width / 2), at(i, -width / 2), at(i + 1, -width / 2));
      }
    }
  } else {
    const closed = source instanceof L.Polygon;
    const polygon = rings => {
      const projected = rings.map(ring => ring.map(latlng => map.project(latlng)));
      if (closed && options.fill && projected[0]?.length >= 3) {
        const valid = projected.filter(ring => ring.length >= 3);
        const vertices = valid.flat();
        for (const indices of triangulate(valid[0], valid.slice(1))) {
          triangle(fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
        }
      }
      for (const ring of projected) line(ring, closed);
    };
    const visit = coordinates => {
      if (!coordinates.length) return;
      if (coordinates[0] instanceof L.LatLng) polygon([coordinates]);
      else if (closed && coordinates[0][0] instanceof L.LatLng) polygon(coordinates);
      else for (const child of coordinates) visit(child);
    };
    visit(source.getLatLngs());
  }
  return { fill, stroke };
}
