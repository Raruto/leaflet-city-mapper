/**
 * Reusable multisampled depth texture descriptor for renderer resizing.
 *
 * @type {Object}
 */
export const depthTexture = {
  size: [null, null],
  format: 'depth24plus',
  sampleCount: 4,
  usage: null
};
