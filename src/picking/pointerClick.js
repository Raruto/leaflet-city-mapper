import * as onClick from './onClick.js';

/**
 * Forward a pointer click to the layer's feature handler.
 *
 * @param {MouseEvent} event Click event.
 */
export function pointerClick(event) {
  onClick.onClick(this, event);
}
