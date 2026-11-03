
export function destroyTexture(backend, texture) {
  backend.renderer.device.queue.onSubmittedWorkDone().then(() => texture.destroy(), error => {
    backend.fire('error', { error });
    texture.destroy();
  });
}
