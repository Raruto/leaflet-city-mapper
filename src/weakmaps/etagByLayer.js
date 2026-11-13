/**
 * Archive response ETags used to detect changes across range requests.
 *
 * @type {WeakMap<Object, string>}
 */
export const etagByLayer = new WeakMap();
