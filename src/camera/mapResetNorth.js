import { cameraAnimatedOptions } from '../globals/cameraAnimatedOptions.js';
import { mapSetBearing } from './mapSetBearing.js';

export function mapResetNorth(map, options = cameraAnimatedOptions) { return mapSetBearing(map, 0, options); }
