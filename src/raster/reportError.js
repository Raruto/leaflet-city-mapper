

export function reportError(layer, error) {
  layer.fire('error', { error });
  throw error;
}
