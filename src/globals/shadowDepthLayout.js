/**
 * Reusable bind group layout descriptor for shadow depth uniforms.
 *
 * @type {Object}
 */
export const shadowDepthLayout = {
  entries: [{
    binding: 0,
    visibility: null,
    buffer: {
      type: 'uniform'
    }
  }]
};
