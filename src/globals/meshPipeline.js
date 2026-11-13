/**
 * Reusable WebGPU render pipeline descriptor for scene meshes.
 *
 * @type {Object}
 */
export const meshPipeline = {
  layout: null,
  vertex: {
    module: null,
    entryPoint: 'vertexMain',
    buffers: null
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: [{
      format: null,
      blend: null,
      writeMask: null
    }]
  },
  primitive: {
    topology: 'triangle-list',
    cullMode: null,
    frontFace: null
  },
  multisample: { count: 4 },
  depthStencil: {
    format: 'depth24plus',
    depthWriteEnabled: null,
    depthCompare: null
  }
};
