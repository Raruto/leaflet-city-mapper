/**
 * Forward a native backend error to its source layer.
 *
 * @param {Object} event Error event.
 */
export function forwardNativeError({ error }) {
  this.source.fire('error', /* alloc */ { error });
}
