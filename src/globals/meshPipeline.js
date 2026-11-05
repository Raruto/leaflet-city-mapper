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
  depthStencil: {
    format: 'depth24plus',
    depthWriteEnabled: null,
    depthCompare: null
  }
};
