

export function reportError(layer, error) {
  layer.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error });
  throw error;
}
