import { state as sharedState } from '../state.js';

export async function loadImage(description, directory, image) {
  let blob;
  if (image.bufferView !== undefined) {
    const view = description.bufferViews[image.bufferView];
    const buffer = description.buffers[view.buffer].binary;
    blob = /* allocation: required -- Image decoding retains a blob for this concurrent texture request. */ new Blob(
      /* allocation: required -- The blob constructor consumes this image-specific byte range. */ [buffer.slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)],
      /* allocation: required -- The blob options carry this image-specific MIME type. */ { type: image.mimeType });
  } else {
    const response = await fetch(/* allocation: required -- URL resolution is bound to this concurrent texture request. */ new URL(image.uri, directory).href);
    if (!response.ok) throw /* allocation: required -- Failed requests retain their own HTTP error and stack. */ new Error(`Unable to load model texture: HTTP ${response.status}`);
    blob = await response.blob();
  }
  // Preserve straight alpha and raw samples; GPU sRGB formats do color decoding.
  return createImageBitmap(blob, sharedState.allocationGeometryImageOptions);
}
