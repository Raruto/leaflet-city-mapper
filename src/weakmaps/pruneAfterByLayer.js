/**
 * Earliest time to revisit raster tile pruning, keyed by layer.
 *
 * @type {WeakMap<Object, number>}
 */
export const pruneAfterByLayer = new WeakMap();
