/**
 * WebGPU vertex buffer layout for three-component vertex colors.
 *
 * @type {Object}
 */
export const colorLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 2,
    offset: 0,
    format: 'float32x3'
  })])
});
