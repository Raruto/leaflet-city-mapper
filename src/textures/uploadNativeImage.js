export function uploadNativeImage(state, key, texture, image, device, width, height) {
  try {
    device.queue.copyExternalImageToTexture(
      /* alloc */ { source: image },
      /* alloc */ { texture: texture.texture },
      /* alloc */ [width, height]);
  } catch (error) {
    texture.texture.destroy();
    state.textures.delete(key);
    throw error;
  }
  texture.uploaded = image;
}
