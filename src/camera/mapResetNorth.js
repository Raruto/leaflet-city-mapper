import { mapSetBearing } from './mapSetBearing.js';
import { state as sharedState } from '../state.js';
export function mapResetNorth(map, options = sharedState.allocationCameraAnimatedOptions) { return mapSetBearing(map, 0, options); }
