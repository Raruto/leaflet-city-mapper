import { pitchDragRemoveHooks } from './pitchDragRemoveHooks.js';

/**
 * Remove this rotate control's map listeners and drag interaction.
 *
 * @param {L.Map} map Map containing the control.
 */
export function rotateOnRemove(map) {
  map.off('rotate pitch', this._refresh, this);
  pitchDragRemoveHooks.call(this);
}
