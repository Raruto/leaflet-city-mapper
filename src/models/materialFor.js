import { textureFor } from './textureFor.js';

export function materialFor(context, material) {
  const { backend } = context;
  const pbr = material.pbrMetallicRoughness;
  return /* allocation: required -- Each model retains its independently editable material style. */ {
    color: pbr?.baseColorFactor ? pbr.baseColorFactor.slice(0, 3) : /* allocation: required -- This material owns its editable default base color. */ [1, 1, 1],
    opacity: pbr?.baseColorFactor?.[3] ?? 1,
    metallic: pbr?.metallicFactor ?? 1,
    roughness: pbr?.roughnessFactor ?? 1,
    baseTexture: textureFor(context, pbr?.baseColorTexture, true),
    metalTexture: textureFor(context, pbr?.metallicRoughnessTexture),
    emissiveTexture: textureFor(context, material.emissiveTexture, true),
    occlusionTexture: textureFor(context, material.occlusionTexture),
    emissive: material.emissiveFactor || /* allocation: required -- This material owns its editable default emission color. */ [0, 0, 0],
    occlusionStrength: material.occlusionTexture?.strength ?? 1,
    alphaMode: backend.options.alphaMode || material.alphaMode || 'OPAQUE',
    alphaCutoff: material.alphaCutoff ?? 0.5,
    doubleSided: material.doubleSided,
  };
}
