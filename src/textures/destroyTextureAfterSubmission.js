/**
 * Destroy a GPU resource after submitted work settles, reporting a rejected submission.
 *
 * @param {L.Layer} layer Layer receiving error events.
 * @param {GPUTexture|GPUBuffer} texture Resource to destroy.
 * @param {Promise<void>} submitted Completion of previously submitted work.
 *
 * @returns {Promise<void>} Completion of resource destruction.
 */
export async function destroyAfterSubmission(layer, texture, submitted) {
  try {
    await submitted;
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
  texture.destroy();
}
