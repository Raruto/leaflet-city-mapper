/**
 * WebGPU blend configuration for transparent material color and alpha.
 *
 * @type {Object}
 */
export const alphaBlend = {
  color: {
    srcFactor: 'src-alpha',
    dstFactor: 'one-minus-src-alpha',
    operation: 'add'
  },
  alpha: {
    srcFactor: 'one',
    dstFactor: 'one-minus-src-alpha',
    operation: 'add'
  },
};
