export function forwardNativeError({ error }) {
  this.source.fire('error', /* allocation: required -- Forwarded errors must not share mutable event data between layers. */ { error });
}
