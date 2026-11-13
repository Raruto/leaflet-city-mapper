/**
 * Reusable depth render pipeline descriptor for shadow meshes.
 *
 * @type {Object}
 */
export const shadowPipeline = {
  layout: null,
  vertex: {
    module: null,
    entryPoint: 'main',
    buffers: null
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: []
  },
  primitive: {
    topology: 'triangle-list',
    cullMode: 'none'
  },
  depthStencil: {
    format: 'depth32float',
    depthWriteEnabled: true,
    depthCompare: 'less',
    depthBias: 2,
    depthBiasSlopeScale: 2
  }
};
