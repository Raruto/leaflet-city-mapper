import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { instanceAreaGeometry } from '../../src/geometry/instanceAreaGeometry.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';
import { treeGeometry } from '../../src/geometry/treeGeometry.js';
import { addTriangle } from '../../src/geometry/appendAreaTriangle.js';

Then('source instancing preserves vertex data and falls back for incompatible features', function () {
  const context = {
    backend: { options: {} },
    positions: [-0.75, -0.25, 0.5, -0.25, -0.25, 0.5, -0.5, 0.25, 0.5,
      0.25, -0.25, 0.5, 0.75, -0.25, 0.5, 0.5, 0.25, 0.5],
    normals: Array(6).fill([0, 0, 1]).flat(), colors: Array(18).fill(1),
    featureFaces: [{ vertexStart: 0, vertexEnd: 3 }, { vertexStart: 3, vertexEnd: 6 }],
  };
  const data = instanceAreaGeometry(context);
  assert.notEqual(data, context);
  assert.equal(data.positions.length, 9);
  assert.equal(data.instanceOffsets.length, 8);
  const expanded = [];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < data.positions.length; j++) {
      expanded.push(Math.fround(data.positions[j] + data.instanceOffsets[i * 4 + j % 3]));
    }
  }
  assert.deepEqual(expanded, context.positions);
  const geometry = { attributes: {
    position: { data: data.positions }, instanceOffset: { data: data.instanceOffsets, size: 4 },
  } };
  computeBounds(geometry);
  assert.deepEqual(geometry.bounds.min, [-0.75, -0.25, 0.5]);
  assert.deepEqual(geometry.bounds.max, [0.75, 0.25, 0.5]);
  const bytes = (data.positions.length + data.normals.length + data.colors.length + data.instanceOffsets.length) * 4;
  assert.equal(bytes, 140);
  assert.equal((context.positions.length + context.normals.length + context.colors.length) * 4, 216);
  for (const change of [
    copy => { copy.positions[12] += 0.1; },
    copy => { copy.normals[9] = 1; },
    copy => { copy.colors[9] = 0; },
    copy => { copy.featureFaces[1].vertexStart = 2; },
    copy => { copy.backend.options.nightLight = true; },
    copy => { copy.featureFaces.pop(); },
    copy => { copy.positions[0] = 0.1; copy.positions[9] = 0.2; },
  ]) {
    const copy = structuredClone(context);
    change(copy);
    assert.equal(instanceAreaGeometry(copy), copy);
  }
  for (const origin of [0, 16, 1234.125]) {
    const trees = { backend: { options: {} }, positions: [], normals: [], colors: [], uvs: [], featureFaces: [] };
    for (let i = 0; i < 100; i++) {
      const start = trees.positions.length / 3;
      treeGeometry({ x: origin + i * 16, y: 0, ground: 0 },
        { top: 8, trunkRadius: 0.25, crownRadius: 2, crownBottom: 3 },
        (...args) => addTriangle(trees, ...args));
      trees.featureFaces.push({ vertexStart: start, vertexEnd: trees.positions.length / 3 });
    }
    const compact = instanceAreaGeometry(trees);
    assert.notEqual(compact, trees);
    const originalBytes = (trees.positions.length + trees.normals.length + trees.colors.length) * 4;
    const compactBytes = (compact.positions.length + compact.normals.length + compact.colors.length +
      compact.instanceOffsets.length) * 4;
    assert(compactBytes < originalBytes * 0.02, '100 identical trees must use less than 2% of the original vertex bytes');
    for (let i = 0; i < trees.positions.length; i++) {
      const instance = Math.floor(i / compact.positions.length);
      assert(Math.fround(compact.positions[i % compact.positions.length] +
        compact.instanceOffsets[instance * 4 + i % 3]) === Math.fround(trees.positions[i]));
    }
  }
});

Then('instanced sources preserve rendered pixels, shadows, picking and resource lifetime', { timeout: 60000 }, async function () {
  await this.page.goto(this.baseUrl);
  const result = await this.page.evaluate(async () => {
    const { attachAreaMesh } = await import('/src/sources/attachAreaMesh.js');
    const { emptyNode } = await import('/src/scene/createSceneNode.js');
    const globals = await import('/test/fixtures/globals.js');
    const { updateWorldMatrix } = await import('/src/transforms/updateWorldMatrix.js');
    const { prepareFrameUniforms } = await import('/src/rendering/prepareFrameUniforms.js');
    const { drawSceneMeshes } = await import('/src/rendering/drawSceneMeshes.js');
    const { ensureShadowPipeline } = await import('/src/shadows/ensureShadowPipeline.js');
    const { drawShadowMeshes } = await import('/src/shadows/drawShadowMeshes.js');
    const { bindSunlight } = await import('/src/shadows/bindSunlight.js');
    const { intersectMeshes } = await import('/src/collision/intersectMeshes.js');
    const { setHighlight } = await import('/src/picking/setHighlight.js');
    const { releaseArea } = await import('/src/sources/releaseArea.js');
    const { restoreObject } = await import('/src/scene/restoreObject.js');
    const { computeBounds } = await import('/src/geometry/computeBounds.js');
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const otherAdapter = await navigator.gpu.requestAdapter();
    const otherDevice = await otherAdapter.requestDevice();
    const errors = [];
    device.addEventListener('uncapturederror', event => errors.push(event.error.message));
    otherDevice.addEventListener('uncapturederror', event => errors.push(event.error.message));
    const makeBackend = gpu => {
      const color = gpu.createTexture({ size: [64, 64], format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
      const sun = {
        layout: gpu.createBindGroupLayout({ entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'depth' } },
          { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'comparison' } },
          { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        ] }),
        buffer: gpu.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
        lights: gpu.createBuffer({ size: 32, usage: GPUBufferUsage.STORAGE }),
        texture: gpu.createTexture({ size: [64, 64], format: 'depth32float',
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC }),
        sampler: gpu.createSampler({ compare: 'less-equal' }),
      };
      gpu.queue.writeBuffer(sun.buffer, 0, new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0]));
      const identity = new DOMMatrix().toFloat64Array();
      const backend = {
        options: { nightSparkle: true }, root: emptyNode(), fire: (type, event) => errors.push(event.error.message),
        camera: { viewMatrix: identity, projectionMatrix: identity },
        renderer: { device: gpu, sunlight: sun, format: 'rgba8unorm', canvas: { width: 64, height: 64 },
          context: { getCurrentTexture: () => color },
          depthTexture: gpu.createTexture({ size: [64, 64], format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT }) },
      };
      globals.sceneByLayer.set(backend, backend);
      globals.sceneByLayer.get(backend)._shared = backend;
      bindSunlight(backend);
      return backend;
    };
    const backend = makeBackend(device), other = makeBackend(otherDevice);
    const context = {
      backend, area: { request: new AbortController() },
      positions: [-0.75, -0.25, 0.5, -0.25, -0.25, 0.5, -0.5, 0.25, 0.5,
        0.25, -0.25, 0.5, 0.75, -0.25, 0.5, 0.5, 0.25, 0.5],
      normals: Array(6).fill([0, 0, 1]).flat(), colors: Array(18).fill(1), lights: [], skipped: 0,
      featureFaces: [
        { id: 'left', vertexStart: 0, vertexEnd: 3, faceStart: 0, faceEnd: 1 },
        { id: 'right', vertexStart: 3, vertexEnd: 6, faceStart: 1, faceEnd: 2 },
      ],
    };
    attachAreaMesh(context);
    const compact = context.area.mesh;
    compact._appearance = 1;
    compact.fadeDuration = 0;
    updateWorldMatrix(compact);
    // One range prevents compaction and supplies the original, expanded reference.
    const reference = { ...context, area: { request: new AbortController() },
      featureFaces: [{ vertexStart: 0, vertexEnd: 6, faceStart: 0, faceEnd: 2 }] };
    attachAreaMesh(reference);
    const expanded = reference.area.mesh;
    expanded._appearance = 1;
    updateWorldMatrix(expanded);
    const capture = async (owner, mesh, shadow = false) => {
      const meshes = Array.isArray(mesh) ? mesh : [mesh];
      prepareFrameUniforms(owner, meshes, shadow ? meshes : [], undefined);
      const gpu = globals.sceneByLayer.get(owner).renderer.device;
      const encoder = gpu.createCommandEncoder();
      if (shadow) {
        ensureShadowPipeline(gpu, globals.sceneByLayer.get(owner).renderer.sunlight);
        ensureShadowPipeline(gpu, globals.sceneByLayer.get(owner).renderer.sunlight, true);
        drawShadowMeshes(owner, encoder, meshes);
      } else drawSceneMeshes(owner, encoder, meshes);
      gpu.queue.writeBuffer(globals.sceneByLayer.get(owner).renderer.uniformBuffer, 0, globals.sceneByLayer.get(owner).renderer.uniformData);
      const readback = gpu.createBuffer({ size: 64 * 256, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      encoder.copyTextureToBuffer({
        texture: shadow ? globals.sceneByLayer.get(owner).renderer.sunlight.texture : globals.sceneByLayer.get(owner).renderer.context.getCurrentTexture(),
        ...(shadow ? { aspect: 'depth-only' } : {}),
      }, { buffer: readback, bytesPerRow: 256 }, [64, 64]);
      gpu.queue.submit([encoder.finish()]);
      await readback.mapAsync(GPUMapMode.READ);
      const pixels = Array.from(new Uint8Array(readback.getMappedRange()));
      readback.unmap();
      readback.destroy();
      return pixels;
    };
    try {
      const original = await capture(backend, expanded), instanced = await capture(backend, compact);
      const originalShadow = await capture(backend, expanded, true), instancedShadow = await capture(backend, compact, true);
      const mixed = await capture(backend, [expanded, compact]);
      const mixedShadow = await capture(backend, [compact, expanded, compact], true);
      const hitFaces = [-0.5, 0.5].map(x =>
        intersectMeshes({ origin: [x, 0, 2], direction: [0, 0, -1] }, [compact])[0]?.faceIndex);
      computeBounds(compact.geometry);
      const bounds = compact.geometry.bounds;
      setHighlight(backend, { ...context.featureFaces[1], mesh: compact });
      expanded.highlight = [3, 6];
      const highlight = await capture(backend, compact), referenceHighlight = await capture(backend, expanded);
      compact.scale[0] = 2;
      updateWorldMatrix(compact);
      const transformedHit = intersectMeshes({ origin: [1, 0, 2], direction: [0, 0, -1] }, [compact])[0];
      compact.scale[0] = 1;
      updateWorldMatrix(compact);
      const oldBuffers = Object.values(compact.geometry.attributes).map(attribute => attribute.buffer);
      const destroyed = new Set();
      for (const buffer of oldBuffers) {
        const destroy = buffer.destroy.bind(buffer);
        buffer.destroy = () => { destroyed.add(buffer); destroy(); };
      }
      restoreObject(compact, other);
      const restored = await capture(other, compact);
      const restoredCount = compact.geometry.attributes.instanceOffset.count;
      const releasedBuffers = Object.values(compact.geometry.attributes).map(attribute => attribute.buffer);
      for (const buffer of releasedBuffers) {
        const destroy = buffer.destroy.bind(buffer);
        buffer.destroy = () => { destroyed.add(buffer); destroy(); };
      }
      releaseArea(backend, context.area);
      await Promise.all([device.queue.onSubmittedWorkDone(), otherDevice.queue.onSubmittedWorkDone()]);
      return {
        original, instanced, originalShadow, instancedShadow, mixed, mixedShadow, highlight, referenceHighlight, restored,
        hitFaces, bounds, transformedFace: transformedHit?.faceIndex, transformedPoint: transformedHit?.point,
        restoredCount, detached: compact.parent === null, highlightCleared: globals.sceneByLayer.get(backend).highlightedFeature === null,
        oldDestroyed: oldBuffers.every(buffer => destroyed.has(buffer)),
        releasedDestroyed: releasedBuffers.every(buffer => destroyed.has(buffer)), errors,
      };
    } finally {
      device.destroy();
      otherDevice.destroy();
    }
  });
  assert.deepEqual(result.errors, []);
  assert(result.original.some(value => value !== 0), 'The reference must actually draw');
  assert.deepEqual(result.instanced, result.original);
  assert.deepEqual(result.instancedShadow, result.originalShadow);
  assert.deepEqual(result.mixed, result.original);
  assert.deepEqual(result.mixedShadow, result.originalShadow);
  assert.deepEqual(result.highlight, result.referenceHighlight);
  assert.notDeepEqual(result.highlight, result.original);
  assert.deepEqual(result.restored, result.highlight);
  assert.deepEqual(result.hitFaces, [0, 1]);
  assert.deepEqual(result.bounds.min, [-0.75, -0.25, 0.5]);
  assert.deepEqual(result.bounds.max, [0.75, 0.25, 0.5]);
  assert.equal(result.transformedFace, 1);
  assert.deepEqual(result.transformedPoint, [1, 0, 0.5]);
  assert.equal(result.restoredCount, 2);
  assert.equal(result.detached, true);
  assert.equal(result.highlightCleared, true);
  assert.equal(result.oldDestroyed, true);
  assert.equal(result.releasedDestroyed, true);
});
