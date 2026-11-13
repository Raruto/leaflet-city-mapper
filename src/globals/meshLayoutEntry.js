/**
 * Reusable bind group layout entry for dynamically offset mesh uniforms.
 *
 * @type {Object}
 */
export const meshLayoutEntry = {
  binding: 0,
  visibility: null,
  buffer: {
    type: 'uniform',
    hasDynamicOffset: true
  }
};
