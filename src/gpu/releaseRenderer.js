/**
 * Wait for submitted GPU work, release renderer resources and destroy the device.
 *
 * @param {Object} renderer Renderer whose resources are released.
 * @param {L.Layer} layer Layer notified if resource cleanup fails.
 *
 * @returns {Promise<void>} Resolves after device destruction.
 */
export async function releaseRenderer(renderer, layer) {
  try {
    await renderer.device.queue.onSubmittedWorkDone();
    renderer.depthTexture?.destroy();
    renderer.colorTexture?.destroy();
    renderer.roofFallbackTexture?.texture?.destroy();
    renderer.uniformBuffer?.destroy();
    renderer.sunlight?.texture?.destroy();
    renderer.sunlight?.buffer?.destroy();
    renderer.sunlight?.lights?.destroy();
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
  renderer.device.destroy();
}
