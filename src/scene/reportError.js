export function reportError(source, error) {
  source.fire('error', /* allocation: required -- Preserve an independent error event for this source. */ { error });
}
