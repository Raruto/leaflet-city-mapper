export async function destroyAfterSubmission(layer, texture, submitted) {
  try {
    await submitted;
  } catch (error) {
    layer.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error });
  }
  texture.destroy();
}
