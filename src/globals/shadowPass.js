/**
 * Reusable depth-only render pass descriptor for shadows.
 *
 * @type {Object}
 */
export const shadowPass = {
  colorAttachments: [],
  depthStencilAttachment: {
    view: null,
    depthClearValue: 1,
    depthLoadOp: 'clear',
    depthStoreOp: 'store'
  }
};
