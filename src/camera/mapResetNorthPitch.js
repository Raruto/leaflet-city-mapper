import { mapAnimateCamera } from './mapAnimateCamera.js';
import { state as sharedState } from '../state.js';
export function mapResetNorthPitch(map, options = sharedState.allocationCameraAnimatedOptions) { return mapAnimateCamera(map, 0, 0, options); }
