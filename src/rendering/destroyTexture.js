
export function destroyTexture(layer, texture) {
  layer.renderer.device.queue.onSubmittedWorkDone().then(() => texture.destroy(), error => {
    layer.fire('error', { error });
    texture.destroy();
  });
}
