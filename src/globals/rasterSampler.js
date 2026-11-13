/**
 * Linear, clamp-to-edge sampling options for raster textures.
 *
 * @type {Object}
 */
export const rasterSampler = {
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge',
  magFilter: 'linear',
  minFilter: 'linear'
};
