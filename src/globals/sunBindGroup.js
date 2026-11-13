/**
 * Reusable bind group descriptor for sunlight uniforms, shadow texture and lights.
 *
 * @type {Object}
 */
export const sunBindGroup = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null
    }
  }, {
    binding: 1,
    resource: null
  }, {
    binding: 2,
    resource: null
  }, {
    binding: 3,
    resource: {
      buffer: null
    }
  }]
};
