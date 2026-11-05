export async function loadImage(description, directory, image) {
  let blob;
  if (image.bufferView !== undefined) {
    const view = description.bufferViews[image.bufferView];
    const buffer = description.buffers[view.buffer].binary;
    blob = new Blob([buffer.slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)],
      { type: image.mimeType });
  } else {
    const response = await fetch(new URL(image.uri, directory).href);
    if (!response.ok) throw new Error(`Unable to load model texture: HTTP ${response.status}`);
    blob = await response.blob();
  }
  // Preserve straight alpha and raw samples; GPU sRGB formats do color decoding.
  return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
}
