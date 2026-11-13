/** Rendering owner per map; entries are removed on the last layer removal. */
/**
 * Shared renderer owner layers keyed by map.
 *
 * @type {WeakMap<Object, Object>}
 */
export const renderers = new WeakMap();
