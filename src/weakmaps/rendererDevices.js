/**
 * Maps owning GPU devices, used to route device errors and loss events.
 *
 * @type {WeakMap<Object, Object>}
 */
export const rendererDevices = new WeakMap();
