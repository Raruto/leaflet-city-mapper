/** Translate glTF sampler constants into WebGPU sampler options. */

export function textureSampler(sampler) {
  return {
    addressModeU: sampler.wrapS === 33071 ? 'clamp-to-edge' : sampler.wrapS === 33648 ? 'mirror-repeat' : 'repeat',
    addressModeV: sampler.wrapT === 33071 ? 'clamp-to-edge' : sampler.wrapT === 33648 ? 'mirror-repeat' : 'repeat',
    magFilter: sampler.magFilter === 9728 ? 'nearest' : 'linear',
    minFilter: sampler.minFilter === 9728 || sampler.minFilter === 9984 || sampler.minFilter === 9986 ? 'nearest' : 'linear',
  };
}
