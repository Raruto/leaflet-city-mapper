/**
 * Reusable bind group layout descriptor for dynamically offset shadow mesh uniforms.
 *
 * @type {Object}
 */
export const shadowMeshLayout = {
  entries: [{
    binding: 0,
    visibility: null,
    buffer: {
      type: 'uniform',
      hasDynamicOffset: true
    }
  }]
};
