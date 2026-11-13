import { meshImage } from '../globals/meshImage.js';
import { meshTarget } from '../globals/meshTarget.js';
import { meshCopySize } from '../globals/meshCopySize.js';

/**
 * Upload a mesh texture's image if it has changed since the previous upload.
 *
 * @param {GPUDevice} device Device owning the texture.
 * @param {Object} texture Texture state containing its image and flip setting.
 */
export function uploadMeshTexture(device, texture) {
  if (texture.uploaded === texture.image) return;
  device.queue.copyExternalImageToTexture(
    (
      meshImage.source = texture.image,
      meshImage.flipY = Boolean(texture.flipY),
      meshImage
    ),
    (
      meshTarget.texture = texture.texture,
      meshTarget
    ),
    (
      meshCopySize[0] = texture.image.width,
      meshCopySize[1] = texture.image.height,
      meshCopySize
    )
  );
  meshImage.source = null;
  meshTarget.texture = null;
  texture.uploaded = texture.image;
}
