/**
 * WebGPU vertex buffer layout for three-component positions.
 *
 * @type {Object}
 */
export const positionLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 0,
    offset: 0,
    format: 'float32x3'
  })])
});
