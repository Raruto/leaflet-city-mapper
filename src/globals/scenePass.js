/**
 * Reusable render pass descriptor for the multisampled scene and depth attachments.
 *
 * @type {Object}
 */
export const scenePass = {
  colorAttachments: [{
    view: null,
    resolveTarget: null,
    clearValue: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    },
    loadOp: 'clear',
    storeOp: 'store'
  }],
  depthStencilAttachment: {
    view: null,
    depthClearValue: 1,
    depthLoadOp: 'clear',
    depthStoreOp: 'store'
  }
};
