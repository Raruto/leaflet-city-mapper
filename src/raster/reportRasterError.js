

export function reportError(layer, error) {
  layer.fire('error', /* alloc */ { error });
  throw error;
}
