import { moves } from '../globals/moves.js';
import { stop } from './stopWalking.js';

/**
 * Track walking keys and Escape without stealing input from text fields or modified shortcuts.
 *
 * @param {KeyboardEvent} event Keydown or keyup event.
 */
export function onKey(event) {
  if (event.type === 'keyup' && event.code === 'Space') this.keys.delete('Space');
  // Text fields and sliders keep their keys; buttons and checkboxes don't.
  if (event.target.closest?.('input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]') ||
    event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.type === 'keydown' && event.code === 'Escape') { this.stop(); return; }
  if (!moves[event.code] && event.code !== 'Space') return;
  event.preventDefault();
  if (event.type === 'keydown') this.keys.add(event.code); else this.keys.delete(event.code);
}
