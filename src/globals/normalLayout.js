/**
 * WebGPU vertex buffer layout for three-component normals.
 *
 * @type {Object}
 */
export const normalLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 1,
    offset: 0,
    format: 'float32x3'
  })])
});
