/**
 * Abort controllers for terrain loading keyed by layer.
 *
 * @type {WeakMap<Object, AbortController>}
 */
export const terrainControllerByLayer = new WeakMap();
