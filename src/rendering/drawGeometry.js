import { meshPipeline } from '../globals/meshPipeline.js';
import { meshImage } from '../globals/meshImage.js';
import { meshTarget } from '../globals/meshTarget.js';
import { meshCopySize } from '../globals/meshCopySize.js';
import { meshBindGroup } from '../globals/meshBindGroup.js';
import { meshOffsets } from '../globals/meshOffsets.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { alphaBlend } from '../globals/alphaBlend.js';
import { drawEntries } from '../globals/drawEntries.js';
import { drawMeshEntry } from '../globals/drawMeshEntry.js';
import { drawFrameEntry } from '../globals/drawFrameEntry.js';
import { drawTerrainEntry } from '../globals/drawTerrainEntry.js';
import { drawTextureEntries } from '../globals/drawTextureEntries.js';
import { drawSamplerEntries } from '../globals/drawSamplerEntries.js';


/** Upload retained CPU data and draw one mesh in the active WebGPU render pass. */

export function drawGeometry(backend, mesh, pass, cullMode, frontFace) {
  const { geometry, program } = mesh;
  const device = sceneByLayer.get(backend).renderer.device;
  // Mixed-LOD imagery composites coarse-to-fine; its depth still occludes later 3D objects.
  // ponytail: self-occlusion during LOD blending needs separate per-LOD depth passes.
  const depthCompare = program.depthTest === false || (mesh.ground && sceneByLayer.get(backend).renderer.groundOverlap)
    ? 'always' : 'less-equal';
  const pipelineKey = `${cullMode}:${frontFace}:${depthCompare}`;
  let pipeline = program.pipelineCache.get(pipelineKey);
  if (!pipeline) {
    pipeline = device.createRenderPipeline((
      meshPipeline.layout = program.pipelineLayout,
      meshPipeline.vertex.module = program.vertex,
      meshPipeline.vertex.buffers = program.vertexBuffers,
      meshPipeline.fragment.module = program.fragment,
      meshPipeline.fragment.targets[0].format = sceneByLayer.get(backend).renderer.format,
      meshPipeline.fragment.targets[0].blend = program.transparent ? alphaBlend : undefined,
      meshPipeline.fragment.targets[0].writeMask = GPUColorWrite.ALL,
      meshPipeline.primitive.cullMode = cullMode,
      meshPipeline.primitive.frontFace = frontFace,
      meshPipeline.depthStencil.depthWriteEnabled = program.depthWrite,
      meshPipeline.depthStencil.depthCompare = depthCompare,
      meshPipeline
    ));
    meshPipeline.layout = null;
    meshPipeline.vertex.module = null;
    meshPipeline.vertex.buffers = null;
    meshPipeline.fragment.module = null;

    program.pipelineCache.set(pipelineKey, pipeline);
  }

  const uniforms = program.uniforms;
  const renderer = sceneByLayer.get(backend).renderer;
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
        meshImage.source = texture.image,
        meshImage.flipY = Boolean(texture.flipY),
        meshImage
      ),
        (
        meshTarget.texture = texture.texture,
        meshTarget
      ),
        (
        meshCopySize[0] = texture.image.width,
        meshCopySize[1] = texture.image.height,
        meshCopySize
      )
      );
      meshImage.source = null;

      meshTarget.texture = null;

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
    const entries = drawEntries;
    entries.length = 0;
    drawMeshEntry.resource.buffer = renderer.uniformBuffer;
    drawFrameEntry.resource.buffer = renderer.uniformBuffer;
    entries.push(drawMeshEntry, drawFrameEntry);
    if (program.terrain) {
      drawTerrainEntry.resource = program.terrain.texture.createView();
      entries.push(drawTerrainEntry);
    }
    mesh.boundBuffer = renderer.uniformBuffer;
    const boundTextures = mesh.boundTextures ||= /* allocation: required -- The mesh retains its own bound-texture snapshots between draws. */ [];
    boundTextures.length = textures.length;
    for (i = 0; i < textures.length; i++) {
      binding = program.bindings[i], texture = textures[i];
      drawTextureEntries[i].binding = binding.texture;
      drawTextureEntries[i].resource = texture.texture.createView();
      drawSamplerEntries[i].binding = binding.sampler;
      drawSamplerEntries[i].resource = texture.sampler;
      entries.push(drawTextureEntries[i], drawSamplerEntries[i]);
      boundTextures[i] ||= /* allocation: required -- Each mesh retains a separate texture-and-sampler comparison tuple for this binding slot. */ [];
      boundTextures[i][0] = texture.texture;
      boundTextures[i][1] = texture.sampler;
    }
    mesh.bindGroup = device.createBindGroup((
      meshBindGroup.layout = program.bindGroupLayout,
      meshBindGroup.entries = entries,
      meshBindGroup
    ));
    meshBindGroup.layout = null;
    meshBindGroup.entries = null;
    drawMeshEntry.resource.buffer = null;
    drawFrameEntry.resource.buffer = null;
    drawTerrainEntry.resource = null;
    for (i = 0; i < textures.length; i++) {
      drawTextureEntries[i].resource = null;
      drawSamplerEntries[i].resource = null;
    }
    entries.length = 0;
  }
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, mesh.bindGroup, (
    meshOffsets[0] = offset,
    meshOffsets
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
