
/**
 * Resolve the bound native layer's readiness promise.
 */
export function resolveNativeReady() {
  this.ready.resolve();
}
