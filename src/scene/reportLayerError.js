/**
 * Emit an error event on a source layer.
 *
 * @param {L.Layer} source Layer receiving the event.
 * @param {Error} error Error to report.
 */
export function reportError(source, error) {
  source.fire('error', /* alloc */ { error });
}
