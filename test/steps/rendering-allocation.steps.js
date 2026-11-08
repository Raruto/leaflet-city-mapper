import * as globals from '../fixtures/globals.js';

import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

import { createProgram } from '../../src/materials/createProgram.js';
import { createGeometry } from '../../src/geometry/createRasterQuadGeometry.js';
import { drawGeometry } from '../../src/rendering/drawGeometry.js';
import { reportCompilation } from '../../src/gpu/reportShaderCompilation.js';
import { terrainAtlas } from '../../src/terrain/terrainAtlas.js';
import { terrainElevation } from '../../src/terrain/terrainElevation.js';
import { terrainGrid } from '../../src/geometry/terrainGrid.js';
import { terrainBuffers } from '../../src/geometry/terrainBuffers.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';
import { updateLayerCount } from '../../src/layer-controls/updateLayerCount.js';
import { countStatusByLayer } from '../../src/weakmaps/countStatusByLayer.js';
import { areasByLayer } from '../../src/weakmaps/areasByLayer.js';
import { headerByLayer } from '../../src/weakmaps/headerByLayer.js';
import { modelUrlByLayer } from '../../src/weakmaps/modelUrlByLayer.js';
import { modelByLayer } from '../../src/weakmaps/modelByLayer.js';
import { geojsonByLayer } from '../../src/weakmaps/geojsonByLayer.js';
import { collectVisibleMesh } from '../../src/rendering/collectVisibleMesh.js';

Then('culling spheres follow bounds and transforms while reusing unchanged world data', function () {
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const projection = identity.slice();
  const frustum = [[1, 0, 0, 1], [-1, 0, 0, 1], [0, 1, 0, 1],
    [0, -1, 0, 1], [0, 0, 1, 1], [0, 0, -1, 1]];
  const candidates = [];
  const mesh = { worldMatrix: identity.slice(), _worldMatrixVersion: 1,
    geometry: { bounds: { center: [0, 0, 0], radius: 0.25 } } };
  const original = Math.hypot;
  let calculations = 0;
  Math.hypot = (...values) => { calculations++; return original(...values); };
  const check = expectedCalculations => {
    calculations = 0;
    candidates.length = 0;
    collectVisibleMesh(mesh, projection, frustum, [1, 1, 1, 1, 1, 1], candidates);
    assert.equal(calculations, expectedCalculations);
    const w = mesh.worldMatrix, c = mesh.geometry.bounds.center;
    const center = [0, 1, 2].map(axis => w[axis] * c[0] + w[axis + 4] * c[1] + w[axis + 8] * c[2] + w[axis + 12]);
    const radius = mesh.geometry.bounds.radius * Math.max(
      original(...w.slice(0, 3)), original(...w.slice(4, 7)), original(...w.slice(8, 11)));
    const expected = frustum.every(plane => plane[0] * center[0] + plane[1] * center[1] + plane[2] * center[2] + plane[3] >= -radius);
    const depth = (projection[2] * center[0] + projection[6] * center[1] + projection[10] * center[2] + projection[14]) /
      (projection[3] * center[0] + projection[7] * center[1] + projection[11] * center[2] + projection[15]);
    assert.equal(mesh._visibleInFrame, expected);
    assert.deepEqual(candidates, expected ? [mesh] : []);
    assert.equal(mesh._sortDepth, depth);
  };
  try {
    check(3);
    const sphere = mesh._cullingSphere;
    check(0);
    projection[14] = 0.5;
    frustum[0][3] = -2;
    check(0);
    assert.equal(mesh._visibleInFrame, false);
    mesh.worldMatrix[12] = 3;
    mesh._worldMatrixVersion++;
    check(3);
    mesh.worldMatrix[0] = -4;
    mesh.worldMatrix[5] = 2;
    mesh._worldMatrixVersion++;
    check(3);
    mesh.geometry.bounds = { center: [1, -1, 2], radius: 3 };
    check(3);
    check(0);
    mesh.worldMatrix = identity.slice();
    check(3);
    delete mesh._worldMatrixVersion;
    mesh.worldMatrix[12] = -10;
    check(3);
    mesh.worldMatrix[12] = 10;
    check(3);
    assert.equal(mesh._cullingSphere, sphere);
    const other = { ...mesh };
    delete other._cullingSphere;
    collectVisibleMesh(other, projection, frustum, [1, 1, 1, 1, 1, 1], []);
    assert.notEqual(other._cullingSphere, sphere);
  } finally {
    Math.hypot = original;
  }
});

Then('mesh bounds match vertex distances for static and instanced geometry', function () {
  for (const data of [
    [-1, 0, -2, 3, 4, 2],
    [7, -3, 5],
    Array.from({ length: 3000 }, (_, i) => Math.sin(i) * 1000),
    [-3e38, 0, 0, 3e38, 1e-38, 0],
  ]) {
    const positions = Float32Array.from(data);
    const geometry = { attributes: { position: { data: positions } } };
    computeBounds(geometry);
    const { min, max, center, radius } = geometry.bounds;
    for (let axis = 0; axis < 3; axis++) {
      const values = Array.from(positions).filter((_, i) => i % 3 === axis);
      assert.equal(min[axis], Math.min(...values));
      assert.equal(max[axis], Math.max(...values));
      assert.equal(center[axis], (min[axis] + max[axis]) / 2);
    }
    let expected = 0;
    for (let i = 0; i < positions.length; i += 3) {
      expected = Math.max(expected, Math.hypot(
        positions[i] - center[0], positions[i + 1] - center[1], positions[i + 2] - center[2]));
    }
    assert.ok(Math.abs(radius - expected) <= Math.max(1, expected) * 1e-14);
    geometry.attributes.instanceOffset = { size: 4, data: Float32Array.from([-10, 2, -3, 0, 5, -4, 7, 0]) };
    computeBounds(geometry);
    assert.deepEqual(geometry.bounds.min, [Math.fround(min[0] - 10), Math.fround(min[1] - 4), Math.fround(min[2] - 3)]);
    assert.deepEqual(geometry.bounds.max, [Math.fround(max[0] + 5), Math.fround(max[1] + 2), Math.fround(max[2] + 7)]);
    assert.equal(geometry.bounds.radius, Math.hypot(...geometry.bounds.max.map((value, i) => value - geometry.bounds.min[i])) / 2);
  }
  for (const value of [1e200, 1e-200, 1e-160]) {
    const geometry = { attributes: { position: { data: [-value, -value, -value, value, value, value] } } };
    computeBounds(geometry);
    assert.ok(Math.abs(geometry.bounds.radius / Math.hypot(value, value, value) - 1) < 1e-14);
  }
});

Then('loading indicators use layer state and retain error accessibility', function () {
  const attributes = new Map();
  const status = { textContent: '', title: '',
    getAttribute: name => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
    hasAttribute: name => attributes.has(name),
    removeAttribute: name => attributes.delete(name) };
  const layer = { _map: {} };
  countStatusByLayer.set(layer, status);
  areasByLayer.set(layer, new Map([['tile', { buildings: 2, done: true }]]));
  headerByLayer.set(layer, {});
  updateLayerCount({ target: layer, type: 'progress' });
  assert.equal(status.textContent, '2');
  updateLayerCount({ target: layer, type: 'progress', loaded: 3, pending: 1 });
  assert.equal(status.textContent, '3…');
  assert.match(status.title, /1 blocks loading/);
  updateLayerCount({ target: layer, type: 'error', error: new Error('Broken tile') });
  assert.equal(status.textContent, 'Error');
  assert.equal(status.getAttribute('role'), 'alert');
  assert.match(status.title, /Broken tile/);
  modelUrlByLayer.set(layer, 'model.glb');
  updateLayerCount({ target: layer, type: 'progress', loaded: 0 });
  assert.equal(status.textContent, '0…');
  assert.equal(status.hasAttribute('role'), false);
  modelByLayer.set(layer, {});
  updateLayerCount({ target: layer, type: 'ready' });
  assert.equal(status.textContent, '1');
  assert.match(status.title, /models/);
  modelUrlByLayer.delete(layer);
  headerByLayer.delete(layer);
  geojsonByLayer.set(layer, true);
  updateLayerCount({ target: layer, type: 'ready' });
  assert.equal(status.textContent, '2');
});

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
    const layouts = [], groups = [], pipelines = [], offsets = [], failures = [], uploads = [], writes = [], draws = [];
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
      queue: {
        writeBuffer(...args) { writes.push(args); },
        copyExternalImageToTexture(source, target, size) {
          uploads.push({ image: source.source, texture: target.texture, size: Array.from(size) });
        },
      },
    };
    const backend = { options: {}, fire: (...event) => failures.push(event),
      renderer: { device, format: 'rgba8unorm', sunlight: { layout: {} }, uniformBuffer: {},
        uniformData: new Float32Array(4096), uniformSlot: 1 } };
    globals.sceneByLayer.set(backend, backend);
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
    const pass = { setPipeline() {}, setVertexBuffer() {}, setIndexBuffer() {},
      drawIndexed(...args) { draws.push(['indexed', ...args]); }, draw(...args) { draws.push(['plain', ...args]); },
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
    assert.equal(uploads.length, 1, 'Unchanged image uploads only once');
    assert.deepEqual(uploads[0], { image: texture.image, texture: texture.texture, size: [256, 128] });
    texture.image = { width: 64, height: 32 };
    drawGeometry(backend, mesh, pass, 'front', 'cw');
    assert.equal(uploads.length, 2);
    assert.equal(groups.length, 2, 'Changing image pixels does not replace bindings');
    texture.sampler = {};
    drawGeometry(backend, mesh, pass, 'front', 'cw');
    assert.equal(groups.length, 3, 'Changing sampler replaces bindings');
    textured.depthTest = false;
    mesh.ground = true;
    mesh._appearance = 0.25;
    mesh.terrain = [1, 2, 3, 4];
    mesh.highlight = [5, 6];
    textured.nightSparkle = true;
    backend.renderer.uniformData[55] = 0.75;
    drawGeometry(backend, mesh, pass, 'front', 'cw');
    assert.equal(pipelines.at(-1).depthCompare, 'always');
    const base = offsets.at(-1)[0] / 4;
    assert.equal(backend.renderer.uniformData[base + 22], 0.25);
    assert.deepEqual(Array.from(backend.renderer.uniformData.slice(base + 28, base + 36)), [1, 2, 3, 4, 5, 6, 0.75, 1]);
    geometry.attributes.position.needsUpdate = true;
    geometry.bounds = {};
    delete geometry.attributes.index;
    geometry.attributes.instanceOffset = { buffer: {}, count: 3 };
    drawGeometry(backend, mesh, pass, 'front', 'cw');
    assert.equal(geometry.attributes.position.needsUpdate, false);
    assert.equal(geometry.bounds, null);
    assert.deepEqual(writes.at(-1), [geometry.attributes.position.buffer, 0, geometry.attributes.position.data]);
    assert.deepEqual(draws.at(-1), ['plain', geometry.drawRange.count, 3, geometry.drawRange.start, 0]);
    for (const name of ['normal', 'color', 'uv', 'instanceOffset']) {
      geometry.attributes[name] ||= { buffer: {}, data: new Float32Array(4) };
      geometry.attributes[name].data ||= new Float32Array(4);
      geometry.attributes[name].needsUpdate = true;
      const bounds = geometry.bounds = {};
      drawGeometry(backend, mesh, pass, 'front', 'cw');
      assert.equal(geometry.attributes[name].needsUpdate, false);
      assert.equal(geometry.bounds, name === 'instanceOffset' ? null : bounds);
      assert.deepEqual(writes.at(-1), [geometry.attributes[name].buffer, 0, geometry.attributes[name].data]);
    }
    textured.uniforms.baseTexture.value = null;
    assert.throws(() => drawGeometry(backend, mesh, pass, 'front', 'cw'), /Missing Layer3D texture: baseTexture/);
    assert.equal(globals.drawMeshEntry.resource.buffer, null);
    assert.equal(globals.drawTextureEntries[0].resource, null);
    assert.equal(globals.drawEntries.length, 0);
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

Then('terrain buffers are cached by subdivision and isolated by backend', function () {
  const previous = globalThis.GPUBufferUsage;
  globalThis.GPUBufferUsage = { VERTEX: 1, INDEX: 2, COPY_DST: 4 };
  try {
    const uploads = [];
    const device = {
      createBuffer(descriptor) { return { ...descriptor }; },
      queue: { writeBuffer(...args) { uploads.push(args); } },
    };
    const first = {}, second = {};
    globals.sceneByLayer.set(first, { renderer: { device }, _terrainGrids: new Map() });
    globals.sceneByLayer.set(second, { renderer: { device }, _terrainGrids: new Map() });
    const grid = terrainBuffers(first, 2);
    assert.equal(uploads.length, 4);
    assert.equal(terrainBuffers(first, 2), grid);
    assert.equal(uploads.length, 4, 'Cached grid never uploads again');
    assert.notEqual(terrainBuffers(first, 4), grid);
    const other = terrainBuffers(second, 2);
    for (const [name, attribute] of Object.entries(grid)) {
      assert.equal(attribute.count, attribute.data.length / attribute.size);
      assert.equal(attribute.buffer.size, Math.max(4, attribute.data.byteLength));
      assert.equal(attribute.buffer.usage, name === 'index' ? 6 : 5);
      assert.notEqual(attribute.buffer, other[name].buffer);
      assert.notEqual(attribute.data, other[name].data);
    }
  } finally {
    if (previous === undefined) delete globalThis.GPUBufferUsage;
    else globalThis.GPUBufferUsage = previous;
  }
});

Then('allocation-free shadow intermediates preserve projection matrices and bounds ownership', async function () {
  const result = await this.page.evaluate(async () => {
    const { shadowMatrix } = await import('/src/shadows/shadowMatrix.js');
    const { shadowBounds } = await import('/src/geometry/shadowBounds.js');
    const { updateCamera } = await import('/src/camera/updateSceneCamera.js');
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
