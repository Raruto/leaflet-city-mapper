import { onAddSun } from './onAddSun.js';

/**
 * Attach this time control's sunlight state to the map.
 *
 * @param {L.Map} map Map receiving the control.
 *
 * @returns {HTMLElement} Time-control container.
 */
export function onAdd(map) {
  return onAddSun(this, map);
}
