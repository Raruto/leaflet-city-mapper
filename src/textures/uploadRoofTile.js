import { roofImage } from '../globals/roofImage.js';
import { roofTarget } from '../globals/roofTarget.js';
import { roofCopySize } from '../globals/roofCopySize.js';

/**
 * Upload a roof tile image when its texture does not already contain it.
 *
 * @param {GPUDevice} device Device owning the destination texture.
 * @param {Object} tile Raster tile with image and texture state.
 */
export function uploadRoofTile(device, tile) {
  const source = tile.texture;
  if (source.uploaded !== source.image) {
    device.queue.copyExternalImageToTexture((
      roofImage.source = tile.image,
      roofImage
    ), (
      roofTarget.texture = source.texture,
      roofTarget
    ), (
      roofCopySize[0] = source.texture.width,
      roofCopySize[1] = source.texture.height,
      roofCopySize
    ));
    roofImage.source = null;
    roofTarget.texture = null;
    source.uploaded = source.image;
  }
}
