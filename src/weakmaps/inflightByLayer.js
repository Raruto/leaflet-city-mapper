/**
 * Number of source area requests currently running for each layer.
 *
 * @type {WeakMap<Object, number>}
 */
export const inflightByLayer = new WeakMap();
