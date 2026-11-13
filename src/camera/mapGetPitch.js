import { cameraPitchByMap } from '../weakmaps/cameraPitchByMap.js';

/**
 * Read a map's stored pitch, defaulting to zero.
 *
 * @param {L.Map} map Map to inspect.
 *
 * @returns {number} Pitch in degrees.
 */
export function mapGetPitch(map) { return cameraPitchByMap.get(map) ?? 0; }
