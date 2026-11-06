import { mapAnimateCamera } from '../animations/mapAnimateCamera.js';
import { mapGetBearing } from './mapGetBearing.js';
export function mapSetPitch(map, pitch, options) { return mapAnimateCamera(map, pitch, mapGetBearing(map), options); }
