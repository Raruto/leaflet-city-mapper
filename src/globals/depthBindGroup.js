/**
 * Reusable bind group descriptor for the shadow depth uniform buffer.
 *
 * @type {Object}
 */
export const depthBindGroup = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null
    }
  }]
};
