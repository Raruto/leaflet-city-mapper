import { textureFor } from '../textures/modelTextureFor.js';

/**
 * Translate a glTF material into renderer material properties and texture bindings.
 *
 * @param {Object} context Model loading context and backend layer.
 * @param {Object} material glTF material definition.
 *
 * @returns {Object} Renderer material properties.
 */
export function materialFor(context, material) {
  const { backend: layer } = context;
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
    alphaMode: layer.options.alphaMode || material.alphaMode || 'OPAQUE',
    alphaCutoff: material.alphaCutoff ?? 0.5,
    doubleSided: material.doubleSided,
  };
}
