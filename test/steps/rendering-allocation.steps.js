import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { state } from '../../src/state.js';
import { createProgram } from '../../src/rendering/createProgram.js';
import { createGeometry } from '../../src/raster/createGeometry.js';
import { drawGeometry } from '../../src/rendering/drawGeometry.js';
import { reportCompilation } from '../../src/rendering/reportCompilation.js';
import { terrainAtlas } from '../../src/terrain/terrainAtlas.js';
import { terrainElevation } from '../../src/terrain/terrainElevation.js';
import { terrainGrid } from '../../src/terrain/terrainGrid.js';

Then('terrain allocation results preserve grid topology and no-data sampling', function () {
  for (const divisions of [1, 2, 4, 64]) {
    const grid = terrainGrid(divisions), next = terrainGrid(divisions);
    const positions = [], normals = [], uvs = [], indices = [];
    for (let row = 0; row <= divisions; row++) {
      for (let column = 0; column <= divisions; column++) {
        positions.push(column / divisions, 0, row / divisions);
        normals.push(0, 1, 0);
        uvs.push(column / divisions, row / divisions);
        if (row < divisions && column < divisions) {
          const a = row * (divisions + 1) + column, b = a + 1, c = a + divisions + 1, d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }
    assert.deepEqual(grid.position.data, Float32Array.from(positions));
    assert.deepEqual(grid.normal.data, Float32Array.from(normals));
    assert.deepEqual(grid.uv.data, Float32Array.from(uvs));
    assert.deepEqual(grid.index.data, Uint16Array.from(indices));
    for (const name of Object.keys(grid)) {
      assert.notEqual(grid[name], next[name]);
      assert.notEqual(grid[name].data, next[name].data);
      grid[name].data[0] = 123;
      assert.notEqual(next[name].data[0], 123);
    }
  }
  const values = new Float32Array(65536).fill(-1e9), tiles = new Map([['0/0', values]]);
  const bounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  for (let mask = 0; mask < 16; mask++) {
    const samples = [10, 20, 30, 40].map((value, index) => mask & (1 << index) ? value : -1e9);
    [values[0], values[1], values[256], values[257]] = samples;
    const expected = mask === 15 ? 25 : samples.find(value => value > -1000) ?? null;
    assert.equal(terrainElevation({ x: 1, y: 1 }, tiles), expected);
  }
  const first = terrainAtlas(tiles, bounds), second = terrainAtlas(tiles, bounds);
  assert.notEqual(first, second);
  assert.notEqual(first.elevations, second.elevations);
  first.elevations[0] = 999;
  assert.equal(second.elevations[0], 10);
  assert.equal(second.low, 10);
  assert.equal(second.high, 40);
});

Then('rendering allocation scratch preserves GPU descriptors and independent uniforms', async function () {
  const names = ['GPUBufferUsage', 'GPUShaderStage', 'GPUColorWrite'];
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  Object.assign(globalThis, {
    GPUBufferUsage: { VERTEX: 1, INDEX: 2, COPY_DST: 4 },
    GPUShaderStage: { VERTEX: 1, FRAGMENT: 2 },
    GPUColorWrite: { ALL: 15 },
  });
  try {
    const layouts = [], groups = [], pipelines = [], offsets = [], failures = [];
    const device = {
      createShaderModule({ code }) {
        return { code, getCompilationInfo: async () => ({ messages: [] }) };
      },
      createBindGroupLayout({ entries }) {
        const layout = { entries: structuredClone(entries) };
        layouts.push(layout);
        return layout;
      },
      createPipelineLayout({ bindGroupLayouts }) { return { layouts: bindGroupLayouts.slice() }; },
      createRenderPipeline(descriptor) {
        const pipeline = { vertex: descriptor.vertex.module, fragment: descriptor.fragment.module,
          blend: structuredClone(descriptor.fragment.targets[0].blend), cullMode: descriptor.primitive.cullMode,
          frontFace: descriptor.primitive.frontFace, depthCompare: descriptor.depthStencil.depthCompare };
        pipelines.push(pipeline);
        return pipeline;
      },
      createBindGroup({ layout, entries }) {
        const group = { layout, entries: entries.map(entry => ({ ...entry,
          resource: entry.resource?.buffer ? { ...entry.resource } : entry.resource })) };
        groups.push(group);
        return group;
      },
      createBuffer({ size, usage }) { return { size, usage }; },
      queue: { writeBuffer() {}, copyExternalImageToTexture() {} },
    };
    const backend = { options: {}, fire: (...event) => failures.push(event),
      renderer: { device, format: 'rgba8unorm', sunlight: { layout: {} }, uniformBuffer: {},
        uniformData: new Float32Array(1024), uniformSlot: 1 } };
    const first = createProgram(backend), second = createProgram(backend);
    assert.notEqual(first.vertexBuffers, second.vertexBuffers);
    assert.ok(Object.isFrozen(first.vertexBuffers[0]));
    assert.ok(Object.isFrozen(first.vertexBuffers[0].attributes[0]));
    first.uniforms.baseColor.value[0] = 0.25;
    first.uniforms.emissive.value[1] = 0.5;
    first.uniforms.opacity.value = 0.4;
    first.pipelineCache.set('owned', {});
    assert.deepEqual(second.uniforms.baseColor.value, [1, 1, 1]);
    assert.deepEqual(second.uniforms.emissive.value, [0, 0, 0]);
    assert.equal(second.uniforms.opacity.value, 1);
    assert.equal(second.pipelineCache.size, 0);
    const texture = { image: { width: 256, height: 128 }, texture: { createView: () => ({ texture: 'first' }) }, sampler: {} };
    const textured = createProgram(backend, { baseTexture: texture, terrain: { texture: { createView: () => ({ dem: true }) } }, alphaMode: 'BLEND' });
    const plainLayout = layouts[0].entries, textureLayout = layouts.at(-1).entries;
    assert.deepEqual(plainLayout.map(entry => entry.binding), [0, 1]);
    assert.deepEqual(textureLayout.map(entry => entry.binding), [0, 1, 2, 3, 4]);
    assert.deepEqual(layouts[0].entries, plainLayout, 'Later programs must not mutate consumed layout descriptors');
    const geometry = createGeometry(device), other = createGeometry(device);
    geometry.attributes.position.data[0] = 5;
    assert.equal(other.attributes.position.data[0], 0);
    assert.notEqual(geometry.drawRange, other.drawRange);
    const pass = { setPipeline() {}, setVertexBuffer() {}, setIndexBuffer() {}, drawIndexed() {},
      setBindGroup(index, group, dynamicOffsets) { offsets.push(Array.from(dynamicOffsets)); } };
    const mesh = { program: textured, geometry, worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
    drawGeometry(backend, mesh, pass, 'back', 'ccw');
    assert.equal(groups.length, 1);
    assert.equal(groups[0].entries[0].resource.buffer, backend.renderer.uniformBuffer);
    assert.deepEqual(groups[0].entries.map(entry => entry.binding), [0, 1, 2, 3, 4]);
    assert.equal(pipelines[0].blend.color.srcFactor, 'src-alpha');
    drawGeometry(backend, mesh, pass, 'back', 'ccw');
    assert.equal(groups.length, 1);
    assert.equal(pipelines.length, 1);
    backend.renderer.uniformBuffer = {};
    drawGeometry(backend, mesh, pass, 'front', 'cw');
    assert.equal(groups.length, 2);
    assert.equal(pipelines.length, 2);
    assert.equal(pipelines[1].frontFace, 'cw');
    assert.notEqual(groups[0].entries[0].resource.buffer, groups[1].entries[0].resource.buffer);
    assert.deepEqual(offsets, [[256], [512], [768]]);
    assert.equal(state.allocationRenderDrawMeshEntry.resource.buffer, null);
    assert.equal(state.allocationRenderDrawTextureEntries[0].resource, null);
    assert.equal(state.allocationRenderDrawEntries.length, 0);
    await Promise.resolve();
    assert.deepEqual(failures, []);
    await reportCompilation(backend, [Promise.resolve({ messages: [{ type: 'error', message: '' }] })]);
    assert.equal(failures.length, 1, 'An empty compiler error still reports a compilation failure');
    assert.equal(failures[0][1].error.message, 'Unable to compile Layer3D WGSL: ');
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete globalThis[name];
      else globalThis[name] = previous[name];
    }
  }
});

Then('allocation-free shadow intermediates preserve projection matrices and bounds ownership', async function () {
  const result = await this.page.evaluate(async () => {
    const { shadowMatrix } = await import('/src/shadows/shadowMatrix.js');
    const { shadowBounds } = await import('/src/shadows/shadowBounds.js');
    const { updateCamera } = await import('/src/scene/updateCamera.js');
    const mesh = { worldMatrix: [2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 50, 20, -40, 1],
      _worldMatrixVersion: 1, geometry: { bounds: { min: [-5, -2, -3], max: [10, 8, 6] },
        attributes: { position: {} } } };
    const meshes = [mesh], snapshots = [], maximumErrors = [];
    for (const direction of [[0, 1, 0], [0.3, 0.8, 0.5], [-0.5, 0.2, -0.8]]) {
      const { min, max } = shadowBounds(meshes);
      const center = min.map((value, i) => (value + max[i]) / 2);
      const radius = Math.max(100, Math.hypot(...min.map((value, i) => max[i] - value)));
      const camera = { position: center.map((value, i) => value + direction[i] * radius * 2),
        target: center, up: [0, 0, -1], fov: 45, aspect: 1, near: 1, far: radius * 5,
        x: [0, 0, 0], y: [0, 0, 0], z: [0, 0, 0],
        viewTransform: new DOMMatrix(), projectionTransform: new DOMMatrix(), projectionViewTransform: new DOMMatrix(),
        viewMatrix: [], projectionMatrix: [], projectionViewMatrix: [] };
      updateCamera(camera);
      const view = new DOMMatrix(camera.viewMatrix), low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < 8; i++) {
        const point = new DOMPoint(...min.map((value, axis) => i & (1 << axis) ? max[axis] : value), 1).matrixTransform(view);
        for (const [axis, value] of [point.x, point.y, point.z].entries()) {
          low[axis] = Math.min(low[axis], value - 20);
          high[axis] = Math.max(high[axis], value + 20);
        }
      }
      const span = high.map((value, i) => value - low[i]);
      const expected = new DOMMatrix([2 / span[0], 0, 0, 0, 0, 2 / span[1], 0, 0,
        0, 0, -1 / span[2], 0, -(high[0] + low[0]) / span[0],
        -(high[1] + low[1]) / span[1], high[2] / span[2], 1]).multiply(view).toFloat32Array();
      const actual = shadowMatrix(meshes, { direction });
      maximumErrors.push(Math.max(...actual.map((value, i) => Math.abs(value - expected[i]))));
      snapshots.push({ actual, values: Array.from(actual) });
    }
    const firstBounds = shadowBounds(meshes), boundsValues = structuredClone(firstBounds);
    const cache = mesh._shadowBounds;
    mesh.worldMatrix[12] += 100; mesh._worldMatrixVersion++;
    shadowBounds(meshes);
    return { maximumErrors, independentResults: snapshots.every(({ actual, values }) => values.every((value, i) => value === actual[i])),
      independentBounds: JSON.stringify(firstBounds) === JSON.stringify(boundsValues), reusedCache: mesh._shadowBounds === cache };
  });
  assert.ok(result.maximumErrors.every(error => error < 1e-6), JSON.stringify(result));
  assert.equal(result.independentResults, true);
  assert.equal(result.independentBounds, true);
  assert.equal(result.reusedCache, true);
});
