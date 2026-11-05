import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
/** Upload retained CPU data and draw one mesh in the active WebGPU render pass. */

export function drawGeometry(backend, mesh, pass, cullMode, frontFace) {
  const gpuCreateRenderPipeline1 = sharedState.allocationRenderDrawGeometryCreateRenderPipeline1;
  const gpuCopyExternalImageToTexture2 = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture2;
  const gpuCopyExternalImageToTexture3 = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture3;
  const gpuCopyExternalImageToTexture4 = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture4;
  const gpuCreateBindGroup5 = sharedState.allocationRenderDrawGeometryCreateBindGroup5;
  const gpuSetBindGroup6 = sharedState.allocationRenderDrawGeometrySetBindGroup6;
  const { geometry, program } = mesh;
  const device = pluginState(backend).renderer.device;
  // Mixed-LOD imagery composites coarse-to-fine; its depth still occludes later 3D objects.
  // ponytail: self-occlusion during LOD blending needs separate per-LOD depth passes.
  const depthCompare = program.depthTest === false || (mesh.ground && pluginState(backend).renderer.groundOverlap)
    ? 'always' : 'less-equal';
  const pipelineKey = `${cullMode}:${frontFace}:${depthCompare}`;
  let pipeline = program.pipelineCache.get(pipelineKey);
  if (!pipeline) {
    pipeline = device.createRenderPipeline((
      gpuCreateRenderPipeline1.layout = program.pipelineLayout,
      gpuCreateRenderPipeline1.vertex.module = program.vertex,
      gpuCreateRenderPipeline1.vertex.buffers = program.vertexBuffers,
      gpuCreateRenderPipeline1.fragment.module = program.fragment,
      gpuCreateRenderPipeline1.fragment.targets[0].format = pluginState(backend).renderer.format,
      gpuCreateRenderPipeline1.fragment.targets[0].blend = program.transparent ? sharedState.allocationRenderAlphaBlend : undefined,
      gpuCreateRenderPipeline1.fragment.targets[0].writeMask = GPUColorWrite.ALL,
      gpuCreateRenderPipeline1.primitive.cullMode = cullMode,
      gpuCreateRenderPipeline1.primitive.frontFace = frontFace,
      gpuCreateRenderPipeline1.depthStencil.depthWriteEnabled = program.depthWrite,
      gpuCreateRenderPipeline1.depthStencil.depthCompare = depthCompare,
      gpuCreateRenderPipeline1
    ));
    gpuCreateRenderPipeline1.layout = null;
    gpuCreateRenderPipeline1.vertex.module = null;
    gpuCreateRenderPipeline1.vertex.buffers = null;
    gpuCreateRenderPipeline1.fragment.module = null;

    program.pipelineCache.set(pipelineKey, pipeline);
  }

  const uniforms = program.uniforms;
  const renderer = pluginState(backend).renderer;
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

  const textures = mesh._textures ||= /* allocation: required -- Mesh retains its own texture comparison list between draws. */ [];
  textures.length = 0;
  let binding, texture, i, attribute;
  for (binding of program.bindings) {
    texture = uniforms[binding.name]?.value;
    if (!texture) throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error(`Missing Layer3D texture: ${binding.name}`);
    if (texture.uploaded !== texture.image) {
      device.queue.copyExternalImageToTexture(
        (
        gpuCopyExternalImageToTexture2.source = texture.image,
        gpuCopyExternalImageToTexture2.flipY = Boolean(texture.flipY),
        gpuCopyExternalImageToTexture2
      ),
        (
        gpuCopyExternalImageToTexture3.texture = texture.texture,
        gpuCopyExternalImageToTexture3
      ),
        (
        gpuCopyExternalImageToTexture4[0] = texture.image.width,
        gpuCopyExternalImageToTexture4[1] = texture.image.height,
        gpuCopyExternalImageToTexture4
      )
      );
      gpuCopyExternalImageToTexture2.source = null;

      gpuCopyExternalImageToTexture3.texture = null;

      texture.uploaded = texture.image;
    }
    textures.push(texture);
  }
  let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer ||
    textures.length !== mesh.boundTextures.length;
  for (i = 0; !bindingsChanged && i < textures.length; i++) {
    if (textures[i].texture !== mesh.boundTextures[i][0] ||
      textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
  }
  if (bindingsChanged) {
    const entries = sharedState.allocationRenderDrawEntries;
    entries.length = 0;
    sharedState.allocationRenderDrawMeshEntry.resource.buffer = renderer.uniformBuffer;
    sharedState.allocationRenderDrawFrameEntry.resource.buffer = renderer.uniformBuffer;
    entries.push(sharedState.allocationRenderDrawMeshEntry, sharedState.allocationRenderDrawFrameEntry);
    if (program.terrain) {
      sharedState.allocationRenderDrawTerrainEntry.resource = program.terrain.texture.createView();
      entries.push(sharedState.allocationRenderDrawTerrainEntry);
    }
    mesh.boundBuffer = renderer.uniformBuffer;
    const boundTextures = mesh.boundTextures ||= /* allocation: required -- The mesh retains its own bound-texture snapshots between draws. */ [];
    boundTextures.length = textures.length;
    for (i = 0; i < textures.length; i++) {
      binding = program.bindings[i], texture = textures[i];
      sharedState.allocationRenderDrawTextureEntries[i].binding = binding.texture;
      sharedState.allocationRenderDrawTextureEntries[i].resource = texture.texture.createView();
      sharedState.allocationRenderDrawSamplerEntries[i].binding = binding.sampler;
      sharedState.allocationRenderDrawSamplerEntries[i].resource = texture.sampler;
      entries.push(sharedState.allocationRenderDrawTextureEntries[i], sharedState.allocationRenderDrawSamplerEntries[i]);
      boundTextures[i] ||= /* allocation: required -- Each mesh retains a separate texture-and-sampler comparison tuple for this binding slot. */ [];
      boundTextures[i][0] = texture.texture;
      boundTextures[i][1] = texture.sampler;
    }
    mesh.bindGroup = device.createBindGroup((
      gpuCreateBindGroup5.layout = program.bindGroupLayout,
      gpuCreateBindGroup5.entries = entries,
      gpuCreateBindGroup5
    ));
    gpuCreateBindGroup5.layout = null;
    gpuCreateBindGroup5.entries = null;
    sharedState.allocationRenderDrawMeshEntry.resource.buffer = null;
    sharedState.allocationRenderDrawFrameEntry.resource.buffer = null;
    sharedState.allocationRenderDrawTerrainEntry.resource = null;
    for (i = 0; i < textures.length; i++) {
      sharedState.allocationRenderDrawTextureEntries[i].resource = null;
      sharedState.allocationRenderDrawSamplerEntries[i].resource = null;
    }
    entries.length = 0;
  }
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, mesh.bindGroup, (
    gpuSetBindGroup6[0] = offset,
    gpuSetBindGroup6
  ));

  pass.setVertexBuffer(0, geometry.attributes.position.buffer);
  pass.setVertexBuffer(1, geometry.attributes.normal.buffer);
  if (geometry.attributes.color) pass.setVertexBuffer(2, geometry.attributes.color.buffer);
  if (geometry.attributes.uv) pass.setVertexBuffer(3, geometry.attributes.uv.buffer);
  const instances = geometry.attributes.instanceOffset;
  if (instances) pass.setVertexBuffer(4, instances.buffer);
  for (attribute of Object.values(geometry.attributes)) {
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
