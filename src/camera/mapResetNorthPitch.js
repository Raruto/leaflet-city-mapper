import { cameraAnimatedOptions } from '../globals/cameraAnimatedOptions.js';
import { mapAnimateCamera } from '../animations/mapAnimateCamera.js';

export function mapResetNorthPitch(map, options = cameraAnimatedOptions) { return mapAnimateCamera(map, 0, 0, options); }
