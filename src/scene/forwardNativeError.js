export function forwardNativeError({ error }) {
  this.source.fire('error', { error });
}
