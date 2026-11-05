
export function rejectNativeReady({ error }) {
  this.ready.reject(error);
}
