export function reportError(source, error) {
  source.fire('error', /* alloc */ { error });
}
