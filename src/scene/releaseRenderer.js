export async function releaseRenderer(renderer, backend) {
  try {
    await renderer.device.queue.onSubmittedWorkDone();
    renderer.depthTexture?.destroy();
    renderer.roofFallbackTexture?.texture?.destroy();
    renderer.uniformBuffer?.destroy();
    renderer.sunlight?.texture?.destroy();
    renderer.sunlight?.buffer?.destroy();
    renderer.sunlight?.lights?.destroy();
  } catch (error) {
    backend.fire('error', /* alloc */ { error });
  }
  renderer.device.destroy();
}
