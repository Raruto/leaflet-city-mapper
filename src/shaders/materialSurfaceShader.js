import { materialBaseShader } from './materialBaseShader.js';

export function materialSurfaceShader(material, sparkle, hasBase, hasMetal, hasEmissive, hasOcclusion, hasRoof) {
  return material.unlit ? /* wgsl */ `
        let rasterTexel = ${hasBase ? 'textureSample(baseTexture, baseTextureSampler, input.uv)' : 'vec4<f32>(input.color, 1.0)'};
        return vec4<f32>(toSRGB(toLinear(rasterTexel.rgb) * (frame.atmosphereTint.rgb * (0.55 + 0.45 * sunlight) + artificial)), ${material.alphaMode === 'BLEND' ? 'u.material.z * rasterTexel.a' : '1.0'});
      ` : /* wgsl */ `${materialBaseShader(material, hasBase, hasRoof)}
      let mr = ${hasMetal ? 'textureSample(metalTexture, metalTextureSampler, input.uv)' : 'vec4<f32>(1.0)'};
      let metal = clamp(u.material.x * mr.b, 0.0, 1.0);
      let rough = clamp(u.material.y * mr.g, 0.08, 1.0);
      let view = normalize(-input.viewPosition);
      let halfVector = normalize(view + frame.lightDirection.xyz);
      let nl = max(dot(normal, frame.lightDirection.xyz), 0.0) * frame.lightDirection.w * sunlight;
      let nv = max(dot(normal, view), 0.001);
      let nh = max(dot(normal, halfVector), 0.0);
      let vh = max(dot(view, halfVector), 0.0);
      let a2 = pow(rough, 4.0);
      let d = a2 / max(PI * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0), 0.0001);
      let gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);
      let gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);
      let visibility = 0.5 / max(gv + gl, 0.0001);
      let f0 = mix(vec3<f32>(0.04), base, metal);
      let fresnel = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);
      let specular = d * visibility * fresnel;
      let diffuse = (1.0 - metal) * base / PI;
      let sky = dot(normal, frame.skyDirection.xyz) * 0.5 + 0.5;
      let ambient = mix(toLinear(vec3<f32>(0.455, 0.412, 0.322)), vec3<f32>(1.0), sky) * (2.0 / PI);
      let ao = ${hasOcclusion ? 'mix(1.0, textureSample(occlusionTexture, occlusionTextureSampler, input.uv).r, u.emissive.w)' : '1.0'};
      ${sparkle ? /* wgsl */ `
        let lattice = (fract(input.localPosition / 2.5) - 0.5) * 2.5;
        let pointGlow = (1.0 - smoothstep(0.16, 0.42, length(lattice))) * u.highlight.z;
      ` : ''}
      // Vertex colour components above 1 are self-lit (e.g. vehicle lamps): dim by day, bright at night.
      let glow = ${sparkle ? 'vec3<f32>(3.0, 2.6, 1.8) * pointGlow +' : ''}${material.vertexColors
      ? ' max(input.color - vec3<f32>(1.0), vec3<f32>(0.0)) * (0.3 + 5.0 * frame.skyDirection.w) +' : ''} u.emissive.rgb * ${hasEmissive
      ? material.emissiveTexture.srgb
        ? 'textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb'
        : 'toLinear(textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb)'
      : 'vec3<f32>(1.0)'};
      var color = ambient * base * (1.0 - metal) * ao +
        (diffuse + specular) * nl * toLinear(vec3<f32>(1.0, 0.937, 0.835)) * 3.0 + glow;
      ${material.vertexColors ? 'color = base * (ambient + toLinear(vec3<f32>(1.0, 0.937, 0.835)) * (3.0 / PI) * nl) + glow;' : ''}
      color = (color - glow) * frame.atmosphereTint.rgb + base * artificial * (1.0 - metal * 0.5) + glow;
      appearance(input.position.xy);
      return vec4<f32>(toSRGB(color), ${material.alphaMode === 'BLEND' ? 'alpha' : '1.0'});
      `;
}
