

/**
 * Emit a raster layer error and propagate it to the caller.
 *
 * @param {L.Layer} layer Layer receiving the error event.
 * @param {Error} error Error to report.
 *
 * @throws {Error} The supplied error.
 */
export function reportError(layer, error) {
  layer.fire('error', /* alloc */ { error });
  throw error;
}
