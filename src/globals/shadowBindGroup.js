/**
 * Reusable bind group descriptor for shadow mesh uniforms.
 *
 * @type {Object}
 */
export const shadowBindGroup = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null,
      size: 144
    }
  }]
};
