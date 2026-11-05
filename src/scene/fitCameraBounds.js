import { pointOf } from './pointOf.js';
import { angles } from './angles.js';
import { verticalGroundY } from './verticalGroundY.js';

export function fitCameraBounds(map, bounds, options = {}) {
  bounds = bounds.getBounds ? bounds.getBounds() : bounds instanceof L.LatLngBounds ? bounds : new L.LatLngBounds(bounds);
  const zoom = map.getZoom() ?? 0, half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
  const min = pointOf(options.paddingTopLeft || options.padding || [0, 0]).subtract(half);
  const max = half.subtract(pointOf(options.paddingBottomRight || options.padding || [0, 0]));
  const [cos, sin, tilt, rise] = angles(map);
  const far = map.getSize().y * map.options.pitchMaxDistance;
  const top = verticalGroundY(min.y, tilt, distance, rise, far);
  const bottom = verticalGroundY(max.y, tilt, distance, rise, far);
  const origin = map.project(bounds.getNorthWest(), zoom).add(map.project(bounds.getSouthEast(), zoom)).divideBy(2);
  const points = [];
  for (const latlng of [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast()]) {
    const p = map.project(latlng, zoom).subtract(origin);
    points.push(new L.Point(cos * p.x - sin * p.y, sin * p.x + cos * p.y));
  }
  let low = Infinity, high = -Infinity;
  for (const point of points) {
    low = Math.min(low, point.y);
    high = Math.max(high, point.y);
  }
  const leftSlope = min.x * rise / distance, rightSlope = max.x * rise / distance;
  const slope = rightSlope - leftSlope;
  let left = Infinity, right = -Infinity;
  for (const point of points) {
    left = Math.min(left, point.x + leftSlope * point.y);
    right = Math.max(right, point.x + rightSlope * point.y);
  }
  // Perspective viewport edges are straight lines on the ground: fit all four corners, not their screen midpoint.
  const scale = Math.min((bottom - top) / (high - low),
    (max.x - min.x - slope * top) / (right - left - slope * low));
  let target = map.getScaleZoom(scale, zoom);
  const snap = map.options.zoomSnap;
  if (snap) target = Math.floor(Math.round(target / (snap / 100)) / 100) * snap;
  target = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), options.maxZoom ?? Infinity, target));
  if (!Number.isFinite(target)) return { center: bounds.getCenter(), zoom: target };
  const actual = map.getZoomScale(target, zoom);
  const vMin = high * actual - bottom, vMax = low * actual - top;
  const v = Math.max(vMin, slope ? (actual * (right - left) - max.x + min.x) / slope : vMin);
  const centerY = (Math.min(vMax, v) + vMax) / 2;
  const centerX = (actual * (left + right) - min.x - max.x - (leftSlope + rightSlope) * centerY) / 2;
  const center = origin.add(new L.Point(cos * centerX + sin * centerY, -sin * centerX + cos * centerY).divideBy(actual));
  return { center: map.unproject(center, zoom), zoom: target };
}
