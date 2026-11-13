/**
 * Reusable render pass descriptor for composing the roof atlas.
 *
 * @type {Object}
 */
export const roofPass = {
  colorAttachments: [{
    view: null,
    clearValue: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    },
    loadOp: 'clear',
    storeOp: 'store'
  }]
};
