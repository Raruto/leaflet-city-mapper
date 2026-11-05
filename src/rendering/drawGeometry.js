/** Upload retained CPU data and draw one mesh in the active WebGPU render pass. */

export function drawGeometry(backend, mesh, pass, cullMode, frontFace) {
  const { geometry, program } = mesh;
  const device = backend.renderer.device;
  // Mixed-LOD imagery composites coarse-to-fine; its depth still occludes later 3D objects.
  // ponytail: self-occlusion during LOD blending needs separate per-LOD depth passes.
  const depthCompare = program.depthTest === false || (mesh.ground && backend.renderer.groundOverlap)
    ? 'always' : 'less-equal';
  const pipelineKey = `${cullMode}:${frontFace}:${depthCompare}`;
  let pipeline = program.pipelineCache.get(pipelineKey);
  if (!pipeline) {
    pipeline = device.createRenderPipeline({
      layout: program.pipelineLayout,
      vertex: {
        module: program.vertex,
        entryPoint: 'vertexMain',
        buffers: program.vertexBuffers,
      },
      fragment: {
        module: program.fragment,
        entryPoint: 'fragmentMain',
        targets: [{
          format: backend.renderer.format,
          blend: program.transparent ? {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          } : undefined,
          writeMask: GPUColorWrite.ALL,
        }],
      },
      primitive: { topology: 'triangle-list', cullMode, frontFace },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: program.depthWrite,
        depthCompare,
      },
    });
    program.pipelineCache.set(pipelineKey, pipeline);
  }

  const uniforms = program.uniforms;
  const renderer = backend.renderer;
  const offset = renderer.uniformSlot++ * 256;
  const data = renderer.uniformData, base = offset / 4;
  data.set(mesh.worldMatrix, base);
  data.set(uniforms.baseColor.value, base + 16);
  data[base + 19] = 1;
  data[base + 20] = uniforms.metallic.value;
  data[base + 21] = uniforms.roughness.value;
  data[base + 22] = uniforms.opacity.value * (mesh.ground ? mesh._appearance ?? 1 : 1);
  data[base + 23] = uniforms.alphaCutoff.value;
  data.set(uniforms.emissive.value, base + 24);
  data[base + 27] = uniforms.occlusionStrength.value;
  data[base + 28] = mesh.terrain?.[0] ?? 0;
  data[base + 29] = mesh.terrain?.[1] ?? 0;
  data[base + 30] = mesh.terrain?.[2] ?? 0;
  data[base + 31] = mesh.terrain?.[3] ?? 0;
  data[base + 32] = mesh.highlight?.[0] ?? 0;
  data[base + 33] = mesh.highlight?.[1] ?? 0;
  data[base + 34] = program.nightSparkle ? data[55] : 0;
  data[base + 35] = mesh.ground ? 1 : mesh._appearance ?? 1;

  const textures = mesh._textures ||= [];
  textures.length = 0;
  for (const binding of program.bindings) {
    const texture = uniforms[binding.name]?.value;
    if (!texture) throw new Error(`Missing Layer3D texture: ${binding.name}`);
    if (texture.uploaded !== texture.image) {
      device.queue.copyExternalImageToTexture(
        { source: texture.image, flipY: Boolean(texture.flipY) },
        { texture: texture.texture },
        [texture.image.width, texture.image.height]
      );
      texture.uploaded = texture.image;
    }
    textures.push(texture);
  }
  let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer ||
    textures.length !== mesh.boundTextures.length;
  for (let i = 0; !bindingsChanged && i < textures.length; i++) {
    if (textures[i].texture !== mesh.boundTextures[i][0] ||
      textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
  }
  if (bindingsChanged) {
    const entries = [
      { binding: 0, resource: { buffer: renderer.uniformBuffer, size: 144 } },
      { binding: 1, resource: { buffer: renderer.uniformBuffer, size: 240 } },
    ];
    if (program.terrain) entries.push({ binding: 2, resource: program.terrain.texture.createView() });
    mesh.boundBuffer = renderer.uniformBuffer;
    const boundTextures = mesh.boundTextures ||= [];
    boundTextures.length = textures.length;
    for (let i = 0; i < textures.length; i++) {
      const binding = program.bindings[i], texture = textures[i];
      entries.push({ binding: binding.texture, resource: texture.texture.createView() });
      entries.push({ binding: binding.sampler, resource: texture.sampler });
      boundTextures[i] ||= [];
      boundTextures[i][0] = texture.texture;
      boundTextures[i][1] = texture.sampler;
    }
    mesh.bindGroup = device.createBindGroup({
      layout: program.bindGroupLayout,
      entries,
    });
  }
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, mesh.bindGroup, [offset]);
  pass.setVertexBuffer(0, geometry.attributes.position.buffer);
  pass.setVertexBuffer(1, geometry.attributes.normal.buffer);
  if (geometry.attributes.color) pass.setVertexBuffer(2, geometry.attributes.color.buffer);
  if (geometry.attributes.uv) pass.setVertexBuffer(3, geometry.attributes.uv.buffer);
  const instances = geometry.attributes.instanceOffset;
  if (instances) pass.setVertexBuffer(4, instances.buffer);
  for (const attribute of Object.values(geometry.attributes)) {
    if (!attribute.needsUpdate) continue;
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    attribute.needsUpdate = false;
    geometry.bounds = null;
  }
  const index = geometry.attributes.index;
  if (index) {
    pass.setIndexBuffer(index.buffer, index.indexFormat);
    pass.drawIndexed(geometry.drawRange.count, instances?.count ?? 1, geometry.drawRange.start, 0, 0);
  } else {
    pass.draw(geometry.drawRange.count, instances?.count ?? 1, geometry.drawRange.start, 0);
  }
}
