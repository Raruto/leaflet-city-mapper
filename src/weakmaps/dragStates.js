/**
 * Mutable holder for camera drag state keyed by interactive element.
 *
 * @type {{value: WeakMap<Element, Object>}}
 */
export const dragStates = { value: new WeakMap() };
