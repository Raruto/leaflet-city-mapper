import { mapAnimateCamera } from './mapAnimateCamera.js';
import { mapGetPitch } from './mapGetPitch.js';
export function mapSetBearing(map, bearing, options) { return mapAnimateCamera(map, mapGetPitch(map), bearing, options); }
