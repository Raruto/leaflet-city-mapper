
/**
 * Reject the native layer's readiness promise on backend error.
 *
 * @param {Object} event Backend error event.
 */
export function rejectNativeReady({ error }) {
  this.ready.reject(error);
}
