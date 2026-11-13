/**
 * Reusable bind group descriptor for compositing roof raster tiles.
 *
 * @type {Object}
 */
export const roofBindGroup = {
  layout: null,
  entries: [{
    binding: 0,
    resource: null
  }, {
    binding: 1,
    resource: null
  }, {
    binding: 2,
    resource: {
      buffer: null,
      offset: null,
      size: 4
    }
  }]
};
