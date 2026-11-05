export function editable(target) {
  return target.closest?.('input,textarea,select,[contenteditable="true"]');
}
