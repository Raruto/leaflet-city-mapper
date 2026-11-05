export const roofPipeline = {
  layout: 'auto',
  vertex: {
    module: null,
    entryPoint: 'vertexMain'
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: [{
      format: 'rgba8unorm',
      blend: {
        color: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        },
        alpha: {
          srcFactor: 'one',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        }
      }
    }]
  },
  primitive: {
    topology: 'triangle-strip'
  }
};
