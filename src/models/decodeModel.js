/** Decode a static glTF JSON document or GLB v2 container. */
import { hasUnsupportedPrimitives } from './hasUnsupportedPrimitives.js';
import { state as sharedState } from '../state.js';

export function decodeModel(data) {
  const view = /* allocation: required -- The view is bound to this model input buffer. */ new DataView(data);
  const decoder = sharedState.allocationGeometryDecoder;
  let description;
  let offset, length, type, chunk;
  if (view.getUint32(0, true) === 0x46546c67) {
    // Decode GLB v2 chunks; unknown types are skipped.
    if (view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== data.byteLength) {
      throw /* allocation: required -- Parse errors retain their own model-specific stack. */ new Error('Invalid GLB header');
    }
    let binary;
    for (offset = 12; offset < data.byteLength;) {
      if (offset + 8 > data.byteLength) {
        throw /* allocation: required -- Parse errors retain their own model-specific stack. */ new Error('Truncated GLB chunk');
      }
      length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
      offset += 8;
      if (offset + length > data.byteLength) {
        throw /* allocation: required -- Parse errors retain their own model-specific stack. */ new Error('Truncated GLB data');
      }
      chunk = data.slice(offset, offset + length);
      if (type === 0x4e4f534a) {
        description = JSON.parse(decoder.decode(chunk));
      }
      if (type === 0x004e4942) {
        binary = chunk;
      }
      offset += length;
    }
    if (!description) {
      throw /* allocation: required -- Parse errors retain their own model-specific stack. */ new Error('Missing GLB JSON');
    }
    if (binary) {
      description.buffers[0].binary = binary;
    }
  } else {
    description = JSON.parse(decoder.decode(data));
  }
  if (description.skins?.length || description.animations?.length || description.extensionsRequired?.length || hasUnsupportedPrimitives(description.meshes)) {
    throw /* allocation: required -- Parse errors retain their own model-specific stack. */ new Error('Layer3D supports static triangle glTF models without required extensions');
  }
  return description;
}
