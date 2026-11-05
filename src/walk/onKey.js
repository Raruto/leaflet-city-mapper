import { moves } from '../constants/moves.js';
import { stop } from './stop.js';

export function onKey(event) {
  // Text fields and sliders keep their keys; buttons and checkboxes don't.
  if (event.target.closest?.('input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]') ||
    event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.type === 'keydown' && event.code === 'Escape') { this.stop(); return; }
  if (!moves[event.code]) return;
  event.preventDefault();
  if (event.type === 'keydown') this.keys.add(event.code); else this.keys.delete(event.code);
}
