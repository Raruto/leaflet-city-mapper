/**
 * Find an editable ancestor of an event target.
 *
 * @param {Element} target Event target.
 *
 * @returns {Element|null|undefined} Editable ancestor, if supported and found.
 */
export function editable(target) {
  return target.closest?.('input,textarea,select,[contenteditable="true"]');
}
