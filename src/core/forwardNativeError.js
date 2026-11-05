export function forwardNativeError({ error }) {
  this.source.fire('error', /* alloc */ { error });
}
