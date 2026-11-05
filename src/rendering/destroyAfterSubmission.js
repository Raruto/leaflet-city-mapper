export async function destroyAfterSubmission(layer, texture, submitted) {
  try {
    await submitted;
  } catch (error) {
    layer.fire('error', { error });
  }
  texture.destroy();
}
