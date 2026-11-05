export function reportError(source, error) {
  source.fire('error', { error });
}
