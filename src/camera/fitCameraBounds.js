import { pointOf } from './pointOf.js';
import { angles } from './angles.js';
import { verticalGroundY } from './verticalGroundY.js';
import { state as sharedState } from '../state.js';

export function fitCameraBounds(map, bounds, options = sharedState.allocationCameraEmptyOptions) {
  bounds = bounds.getBounds ? bounds.getBounds() : bounds instanceof L.LatLngBounds ? bounds
    : /* allocation: required -- Normalize caller coordinates without mutating their bounds. */ new L.LatLngBounds(bounds);
  const zoom = map.getZoom() ?? 0, half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
  const min = pointOf(options.paddingTopLeft || options.padding || sharedState.allocationCameraZeroPadding).subtract(half);
  const max = half.subtract(pointOf(options.paddingBottomRight || options.padding || sharedState.allocationCameraZeroPadding));
  const [cos, sin, tilt, rise] = angles(map, sharedState.allocationCameraAngles);
  const far = map.getSize().y * map.options.pitchMaxDistance;
  const top = verticalGroundY(min.y, tilt, distance, rise, far);
  const bottom = verticalGroundY(max.y, tilt, distance, rise, far);
  const origin = map.project(bounds.getNorthWest(), zoom).add(map.project(bounds.getSouthEast(), zoom)).divideBy(2);
  let low = Infinity, high = -Infinity;
  const leftSlope = min.x * rise / distance, rightSlope = max.x * rise / distance;
  const slope = rightSlope - leftSlope;
  let left = Infinity, right = -Infinity;
  let i, latlng, p, x, y;
  for (i = 0; i < 4; i++) {
    latlng = i === 0 ? bounds.getNorthWest() : i === 1 ? bounds.getNorthEast()
      : i === 2 ? bounds.getSouthWest() : bounds.getSouthEast();
    p = map.project(latlng, zoom).subtract(origin);
    x = cos * p.x - sin * p.y;
    y = sin * p.x + cos * p.y;
    low = Math.min(low, y);
    high = Math.max(high, y);
    left = Math.min(left, x + leftSlope * y);
    right = Math.max(right, x + rightSlope * y);
  }
  // Perspective viewport edges are straight lines on the ground: fit all four corners, not their screen midpoint.
  const scale = Math.min((bottom - top) / (high - low),
    (max.x - min.x - slope * top) / (right - left - slope * low));
  let target = map.getScaleZoom(scale, zoom);
  const snap = map.options.zoomSnap;
  if (snap) target = Math.floor(Math.round(target / (snap / 100)) / 100) * snap;
  target = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), options.maxZoom ?? Infinity, target));
  if (!Number.isFinite(target)) return /* allocation: required -- Fit callers retain independent center and zoom results. */ { center: bounds.getCenter(), zoom: target };
  const actual = map.getZoomScale(target, zoom);
  const vMin = high * actual - bottom, vMax = low * actual - top;
  const v = Math.max(vMin, slope ? (actual * (right - left) - max.x + min.x) / slope : vMin);
  const centerY = (Math.min(vMax, v) + vMax) / 2;
  const centerX = (actual * (left + right) - min.x - max.x - (leftSlope + rightSlope) * centerY) / 2;
  origin.x += (cos * centerX + sin * centerY) / actual;
  origin.y += (-sin * centerX + cos * centerY) / actual;
  return /* allocation: required -- Fit callers retain independent center and zoom results. */ { center: map.unproject(origin, zoom), zoom: target };
}
