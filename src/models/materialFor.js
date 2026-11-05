import { textureFor } from './textureFor.js';

export function materialFor(context, material) {
  const { backend } = context;
  const pbr = material.pbrMetallicRoughness;
  return /* alloc */ {
    color: pbr?.baseColorFactor ? pbr.baseColorFactor.slice(0, 3) : /* alloc */ [1, 1, 1],
    opacity: pbr?.baseColorFactor?.[3] ?? 1,
    metallic: pbr?.metallicFactor ?? 1,
    roughness: pbr?.roughnessFactor ?? 1,
    baseTexture: textureFor(context, pbr?.baseColorTexture, true),
    metalTexture: textureFor(context, pbr?.metallicRoughnessTexture),
    emissiveTexture: textureFor(context, material.emissiveTexture, true),
    occlusionTexture: textureFor(context, material.occlusionTexture),
    emissive: material.emissiveFactor || /* alloc */ [0, 0, 0],
    occlusionStrength: material.occlusionTexture?.strength ?? 1,
    alphaMode: backend.options.alphaMode || material.alphaMode || 'OPAQUE',
    alphaCutoff: material.alphaCutoff ?? 0.5,
    doubleSided: material.doubleSided,
  };
}
