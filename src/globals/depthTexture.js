/**
 * Reusable multisampled depth texture descriptor for renderer resizing.
 *
 * @type {Object}
 */
export const depthTexture = {
  size: [null, null],
  format: 'depth32float',
  sampleCount: 4,
  usage: null
};
