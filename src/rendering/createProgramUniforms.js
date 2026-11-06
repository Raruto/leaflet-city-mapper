export function createProgramUniforms(material) {
  const uniforms = /* alloc */ {
    baseColor: /* alloc */ { value: material.color || /* alloc */ [1, 1, 1] },
    metallic: /* alloc */ { value: material.metallic ?? 0 },
    roughness: /* alloc */ { value: material.roughness ?? 0.85 },
    opacity: /* alloc */ { value: material.opacity ?? 1 },
    alphaCutoff: /* alloc */ { value: material.alphaCutoff ?? 0.5 },
    occlusionStrength: /* alloc */ { value: material.occlusionStrength ?? 1 },
    emissive: /* alloc */ { value: material.emissive || /* alloc */ [0, 0, 0] },
  };
  if (material.baseTexture) uniforms.baseTexture = /* alloc */ { value: material.baseTexture };
  if (material.metalTexture) uniforms.metalTexture = /* alloc */ { value: material.metalTexture };
  if (material.emissiveTexture) uniforms.emissiveTexture = /* alloc */ { value: material.emissiveTexture };
  if (material.occlusionTexture) uniforms.occlusionTexture = /* alloc */ { value: material.occlusionTexture };
  if (material.roofTexture || material.wallTexture) uniforms.roofTexture = /* alloc */ { value: null };
  return uniforms;
}
