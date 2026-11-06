export function restoreMaterialTextures(material, device) {
  let name, texture;
  for (name in material) {
    if (name !== 'baseTexture' && name !== 'metalTexture' && name !== 'emissiveTexture' && name !== 'occlusionTexture') continue;
    texture = material[name];
    if (!texture || texture.device === device) continue;
    texture.device = device;
    texture.texture = device.createTexture(/* alloc */ {
      size: /* alloc */ [texture.image.width, texture.image.height],
      format: texture.format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    texture.sampler = device.createSampler(texture.samplerOptions);
    texture.uploaded = null;
  }
}
