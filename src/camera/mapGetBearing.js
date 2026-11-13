import { cameraBearingByMap } from '../weakmaps/cameraBearingByMap.js';

/**
 * Read a map's stored bearing, defaulting to north.
 *
 * @param {L.Map} map Map to inspect.
 *
 * @returns {number} Bearing in degrees.
 */
export function mapGetBearing(map) { return cameraBearingByMap.get(map) ?? 0; }
