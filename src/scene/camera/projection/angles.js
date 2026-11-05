import { mapCameraState } from '../constants/mapCameraState.js';

export function angles(map) {
  const bearing = map.getBearing() * mapCameraState.radians, pitch = map.getPitch() * mapCameraState.radians;
  return [Math.cos(bearing), Math.sin(bearing), Math.cos(pitch), Math.sin(pitch)];
}
