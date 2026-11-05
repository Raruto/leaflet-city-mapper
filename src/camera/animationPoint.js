import { cameraByMap } from '../globals/cameraByMap.js';


export function animationPoint(map, point, inverse = false) {
  const view = cameraByMap.get(map)._cameraView;
  if (!view) return point;
  const half = map.getSize().divideBy(2), scale = map.getZoomScale(view.zoom);
  const shift = map.project(map.getCenter(), view.zoom).subtract(map.project(view.center, view.zoom));
  return inverse ? point.subtract(half).subtract(shift).divideBy(scale).add(half) :
    point.subtract(half).multiplyBy(scale).add(shift).add(half);
}
