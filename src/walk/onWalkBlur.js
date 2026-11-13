/** Release held movement keys when the window loses focus. */
export function onBlur() {
  this.keys.clear();
}
