import { mapCameraState } from '../../camera/constants/mapCameraState.js';

export function markerCameraIconPoint(x, y) {
  let rotation = this.options.rotation + (this.options.rotateWithView ? this._map.getBearing() * mapCameraState.radians : 0);
  if (this.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
  const scale = this.options.scale;
  return new L.Point((x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
    (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale);
}
