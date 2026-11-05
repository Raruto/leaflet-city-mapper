import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { Then } from '@cucumber/cucumber';
import { startServer } from '../../build/server.js';
import { parseColor } from '../../src/utils/parseColor.js';
import { triangulate } from '../../src/triangulation/triangulate.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';
import { setVertexColor } from '../../src/geometry/setVertexColor.js';
import { treeGeometry } from '../../src/geometry/treeGeometry.js';
import { lightGeometry } from '../../src/geometry/lightGeometry.js';
import { lampPostGeometry } from '../../src/geometry/lampPostGeometry.js';
import { emptyNode } from '../../src/scene/emptyNode.js';
import { setParent } from '../../src/scene/setParent.js';
import { traverse } from '../../src/scene/traverse.js';
import { decodeDirectory } from '../../src/archives/decodeDirectory.js';
import { getZxy } from '../../src/archives/getZxy.js';
import { decodeHeader } from '../../src/archives/decodeHeader.js';
import { decompress } from '../../src/archives/decompress.js';
import { tileId } from '../../src/archives/tileId.js';
import { decodeModel } from '../../src/models/decodeModel.js';
import { loadModel } from '../../src/models/loadModel.js';
import { readAccessor } from '../../src/models/readAccessor.js';
import { nodeMatrix } from '../../src/models/nodeMatrix.js';
import { vertexNormals } from '../../src/geometry/vertexNormals.js';
import { textureSampler } from '../../src/models/textureSampler.js';
import { lightGrid } from '../../src/lighting/lightGrid.js';
import { cacheLightGrid } from '../../src/lighting/cacheLightGrid.js';
import { updatePointLights } from '../../src/lighting/updatePointLights.js';
import { worldLights } from '../../src/lighting/worldLights.js';
import { bridgeElevation } from '../../src/geometry/bridgeElevation.js';
import { terrainElevation } from '../../src/terrain/terrainElevation.js';
import { terrainGrid } from '../../src/terrain/terrainGrid.js';
import { terrainAtlas } from '../../src/terrain/terrainAtlas.js';
import { toLanes } from '../../src/traffic/toLanes.js';
import { tripsAt } from '../../src/traffic/tripsAt.js';
import { routeGeometry } from '../../src/traffic/routeGeometry.js';
import { collider } from '../../src/collision/collider.js';
import { horizontalRay } from '../../src/collision/horizontalRay.js';
import { materialShaders } from '../../src/shaders/materialShaders.js';
import { sortMeshes } from '../../src/rendering/sortMeshes.js';
import { projectCelestialBody } from '../../src/sunlight/projectCelestialBody.js';
import { roofCoverage } from '../../src/geometry/roofCoverage.js';

const checks = {
  'roof-coverage'() {
    const backend = {
      _sceneOrigin: { x: 0, y: 0, lat: 0 },
      _map: { project: point => Array.isArray(point) ? { x: point[1], y: point[0] } : point,
        options: { crs: { scale: () => 40075016.68557849 } } },
    };
    const mesh = { geometry: { bounds: { min: [50, 0, 50], max: [300, 20, 300] } },
      worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
    const layer = { _tileZoom: 1, header: {}, _rasterTiles: new Map() };
    assert.equal(roofCoverage(mesh, backend, [layer]), false);
    for (const [x, y] of [[0, 0], [1, 0], [0, 1]]) {
      layer._rasterTiles.set(`${x}/${y}`, { coords: { x, y, z: 1 }, done: true });
    }
    assert.equal(roofCoverage(mesh, backend, [layer]), false);
    layer._rasterTiles.set('1/1', { coords: { x: 1, y: 1, z: 1 }, done: true });
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    layer._rasterTiles = new Map([['parent', { coords: { x: 0, y: 0, z: 0 }, done: true }]]);
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    layer._rasterTiles.clear();
    layer.header = { minLon: 400, maxLon: 500, maxLat: 400, minLat: 500 };
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    layer.header = { minLon: 0, maxLon: 100, maxLat: 0, minLat: 100 };
    layer._rasterTiles.set('error', { coords: { x: 0, y: 0, z: 1 }, error: 'Reported tile error' });
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
  },

  async 'dev-server'() {
    for (const watch of [false, true]) {
      const server = await startServer(0, { watch });
      const baseUrl = `http://127.0.0.1:${server.address().port}`;
      try {
        for (const name of ['leaflet-city-mapper', 'leaflet-city-mapper-geojson']) {
          const url = `${baseUrl}/examples/${name}.html`;
          const original = await readFile(new URL(`../../examples/${name}.html`, import.meta.url), 'utf8');
          const response = await fetch(url);
          assert.equal(response.status, 200);
          const body = await response.text();
          assert.equal(body, watch
            ? original.replace(/https:\/\/unpkg\.com\/leaflet-city-mapper@\d+\.\d+\.\d+\//g, '/')
            : original);
          const head = await fetch(url, { method: 'HEAD' });
          assert.equal(head.status, 200);
          assert.equal(Number(head.headers.get('content-length')), Buffer.byteLength(body));
          assert.equal(await head.text(), '');
        }
        const response = await fetch(`${baseUrl}/dist/leaflet-city-mapper.js`);
        assert.equal(response.status, 200);
        assert.equal(await response.text(),
          await readFile(new URL('../../dist/leaflet-city-mapper.js', import.meta.url), 'utf8'));
      } finally {
        await new Promise((resolve, reject) => {
          server.close(error => error ? reject(error) : resolve());
          server.closeAllConnections();
        });
      }
    }
  },

  geometry() {
    assert.deepEqual(parseColor(0xff8000), { r: 1, g: 128 / 255, b: 0 });
    const ring = coordinates => coordinates.map(([x, y]) => ({ x, y }));
    const outer = ring([[0, 0], [4, 0], [4, 4], [0, 4]]);
    const hole = ring([[1, 1], [1, 3], [3, 3], [3, 1]]);
    const points = [...outer, ...hole], before = structuredClone(points);
    const triangles = triangulate(outer, [hole]);
    const area = triangles.reduce((sum, ids) => {
      const [a, b, c] = ids.map(i => points[i]);
      return sum + Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    }, 0);
    assert.equal(area, 12);
    assert.deepEqual(points, before);
    assert.throws(() => triangulate(ring([[0, 0], [2, 2], [0, 2], [2, 0]])), /polygon|Polygon/);
    const geometry = { attributes: { position: { data: [-1, 0, -2, 3, 4, 2] }, color: { data: new Float32Array(6) } } };
    computeBounds(geometry);
    assert.deepEqual(geometry.bounds.center, [1, 2, 0]);
    const mesh = { geometry };
    setVertexColor(mesh, 1, 2, parseColor(0xff0000));
    assert.deepEqual([...geometry.attributes.color.data], [0, 0, 0, 1, 0, 0]);
    assert.equal(geometry.attributes.color.needsUpdate, true);
    const point = { x: 0, y: 0, ground: 0 }, emitted = [];
    const add = (...triangle) => emitted.push(triangle);
    treeGeometry(point, { top: 10, trunkRadius: 0.2, crownRadius: 2, crownBottom: 3 }, add);
    lightGeometry(point, { top: 5, lightRadius: 10, color: 0xffffff }, add);
    lampPostGeometry(point, { top: 5, poleRadius: 0.1 }, add);
    assert.ok(emitted.length > 100);
    assert.ok(emitted.every(triangle => Object.values(triangle.at(-1)).every(Number.isFinite)));
  },

  graph() {
    const root = emptyNode(), branch = emptyNode(), leaf = emptyNode(), other = emptyNode();
    setParent(branch, root);
    setParent(leaf, branch);
    setParent(other, root);
    const visited = [];
    traverse(root, node => { visited.push(node); return node === branch; });
    assert.deepEqual(visited, [root, branch, other]);
    setParent(leaf, other);
    assert.deepEqual(branch.children, []);
    assert.equal(leaf.parent, other);
    setParent(leaf, null);
    assert.deepEqual(other.children, []);
    assert.notEqual(root.position, branch.position);
  },

  async archives() {
    assert.deepEqual([[0, 0], [0, 1], [1, 1], [1, 0]].map(([x, y]) => tileId(1, x, y)), [1, 2, 3, 4]);
    assert.throws(() => tileId(1, 2, 0), /Invalid PMTiles tile coordinates/);
    const bytes = Uint8Array.from([2, 1, 3, 1, 1, 2, 3, 1, 0]);
    const firstDirectory = decodeDirectory(bytes.buffer);
    assert.deepEqual(firstDirectory, [
      { tileId: 1, runLength: 1, length: 2, offset: 0 },
      { tileId: 4, runLength: 1, length: 3, offset: 2 },
    ]);
    assert.throws(() => decodeDirectory(new ArrayBuffer(0)), /Truncated PMTiles directory/);
    assert.throws(() => decodeDirectory(Uint8Array.from([...bytes, 0]).buffer), /Trailing PMTiles directory data/);
    for (const [invalid, message] of [
      [[1], /Invalid PMTiles directory count/],
      [[2, 1, 0, 1, 1, 2, 3, 1, 0], /Invalid PMTiles directory tile IDs/],
      [[1, 0, 1, 0, 1], /Invalid PMTiles directory length/],
      [[1, 0, 1, 1, 0], /Invalid PMTiles directory offset/],
      [[1, 0, 1, 1, 128], /Truncated PMTiles directory/],
    ]) {
      assert.throws(() => decodeDirectory(Uint8Array.from(invalid).buffer), message);
      assert.deepEqual(decodeDirectory(bytes.buffer), firstDirectory);
    }
    assert.deepEqual(decodeDirectory(Uint8Array.of(0).buffer), []);
    assert.deepEqual(firstDirectory, [
      { tileId: 1, runLength: 1, length: 2, offset: 0 },
      { tileId: 4, runLength: 1, length: 3, offset: 2 },
    ], 'Later calls must not mutate previous directories');
    assert.notEqual(decodeDirectory(bytes.buffer), firstDirectory);
    const data = new ArrayBuffer(127), view = new DataView(data);
    new Uint8Array(data).set(new TextEncoder().encode('PMTiles'));
    view.setUint8(7, 3);
    assert.throws(() => decodeHeader(new ArrayBuffer(127)), /Expected a PMTiles v3 archive/);
    assert.throws(() => decodeHeader(new ArrayBuffer(8)), /Expected a PMTiles v3 archive/);
    view.setBigUint64(8, 127n, true);
    view.setUint8(100, 4);
    assert.equal(decodeHeader(data).rootDirectoryOffset, 127);
    assert.equal(decodeHeader(data).minZoom, 4);
    assert.equal(await decompress(data, 1), data);
    assert.equal(new TextDecoder().decode(await decompress(gzipSync('utility'), 2)), 'utility');
    await assert.rejects(decompress(data, 3), /Unsupported PMTiles compression/);
    const archive = {
      options: {}, _directories: new Map(),
      _header: Promise.resolve({
        minZoom: 0, maxZoom: 0, rootDirectoryOffset: 0, rootDirectoryLength: 5,
        tileDataOffset: 5, tileDataLength: 1, internalCompression: 1, tileCompression: 1,
      }),
      url: `data:application/octet-stream;base64,${Buffer.from([128, 128, 128, 128, 128, 42]).toString('base64')}`,
    };
    await assert.rejects(getZxy(archive, 0, 0, 0), /Truncated PMTiles directory/);
    assert.equal(archive._directories.size, 0, 'Failed directory reads must be retryable');
    archive.url = `data:application/octet-stream;base64,${Buffer.from([1, 0, 1, 1, 1, 42]).toString('base64')}`;
    const tiles = await Promise.all([getZxy(archive, 0, 0, 0), getZxy(archive, 0, 0, 0)]);
    for (const tile of tiles) assert.deepEqual([...new Uint8Array(tile.data)], [42]);
    assert.equal(archive._directories.size, 1, 'Concurrent reads must share the directory cache');
    let rejectDirectory;
    archive._directories.set('0:5', new Promise((resolve, reject) => { rejectDirectory = reject; }));
    const pending = getZxy(archive, 0, 0, 0);
    await Promise.resolve();
    const replacement = Promise.resolve([{ tileId: 0, runLength: 1, length: 1, offset: 0 }]);
    archive._directories.set('0:5', replacement);
    rejectDirectory(new Error('Evicted directory failed'));
    await assert.rejects(pending, /Evicted directory failed/);
    assert.equal(archive._directories.get('0:5'), replacement, 'An evicted request must not delete its replacement');
  },

  async models() {
    const description = { asset: { version: '2.0' }, meshes: [] };
    const json = new TextEncoder().encode(JSON.stringify(description)).buffer;
    assert.deepEqual(decodeModel(json), description);
    assert.throws(() => decodeModel(new TextEncoder().encode('{"animations":[{}]}').buffer), /static triangle glTF/);
    const model = {
      buffers: [{ binary: new Float32Array([1, 2, 99, 3, 4, 99]).buffer }],
      bufferViews: [{ buffer: 0, byteLength: 24, byteStride: 12 }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 2, type: 'VEC2' }],
    };
    assert.deepEqual([...readAccessor(model, 0).data], [1, 2, 3, 4]);
    model.bufferViews[0].byteLength = 12;
    assert.throws(() => readAccessor(model, 0), /outside buffer view/);
    const sparse = {
      buffers: [{ binary: Uint8Array.from([2, 128]).buffer }],
      bufferViews: [{ buffer: 0, byteLength: 1 }, { buffer: 0, byteOffset: 1, byteLength: 1 }],
      accessors: [{ componentType: 5121, count: 3, type: 'SCALAR', normalized: true,
        sparse: { count: 1, indices: { componentType: 5121, bufferView: 0 }, values: { bufferView: 1 } } }],
    };
    assert.deepEqual([...readAccessor(sparse, 0).data], [...new Float32Array([0, 0, 128 / 255])]);
    const matrix = nodeMatrix({ translation: [2, 3, 4], scale: [2, 3, 4] });
    assert.deepEqual([matrix[0], matrix[5], matrix[10], ...matrix.slice(12)], [2, 3, 4, 2, 3, 4, 1]);
    assert.deepEqual([...vertexNormals([0, 0, 0, 1, 0, 0, 0, 1, 0])], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
    assert.deepEqual(textureSampler({ wrapS: 33071, wrapT: 33648, magFilter: 9728, minFilter: 9986 }),
      { addressModeU: 'clamp-to-edge', addressModeV: 'mirror-repeat', magFilter: 'nearest', minFilter: 'nearest' });
    const originalFetch = globalThis.fetch;
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const root = emptyNode();
    const backend = {
      _added: { promise: Promise.resolve() }, modelUrl: 'model.gltf', root, options: {},
    };
    try {
      globalThis.document = { baseURI: 'https://example.test/' };
      globalThis.fetch = async () => new Response(JSON.stringify({
        asset: { version: '2.0' }, scenes: [{ nodes: [0] }], nodes: [{}],
      }));
      await loadModel(backend);
      assert.equal(backend.model.id, 'https://example.test/model.gltf');
      assert.equal(backend.model.parent, root);
      assert.equal(root.children[0], backend.model);
      assert.equal(backend.model.children.length, 1);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else delete globalThis.document;
    }
  },

  lighting() {
    const matrix = emptyNode().worldMatrix;
    matrix[12] = 10;
    const values = worldLights([{ position: [1, 2, 3], radius: 4, color: [1, 0.5, 0], flux: 4 * Math.PI }], matrix);
    assert.deepEqual([...values.slice(0, 7)], [11, 2, 3, 4, 1, 0.5, 0]);
    const { data, count } = lightGrid([values], 1024);
    assert.equal(count, 1);
    assert.equal(data[5], 1);
    assert.equal(data[9], 1);
    assert.deepEqual([...data.slice(data[8] * 4, data[8] * 4 + 8)], [...values]);
    assert.throws(() => lightGrid([values], 32), /GPU storage limit/);
    assert.deepEqual([...lightGrid([], 32).data], Array(8).fill(0));
    const lamp = { visible: true, worldMatrix: [...matrix], children: [],
      extras: { lights: [{ position: [1, 2, 3], radius: 4, color: [1, 0.5, 0], flux: 4 * Math.PI }] } };
    const cached = cacheLightGrid([lamp], undefined, 1024);
    assert.deepEqual(cached.data, data);
    assert.equal(cacheLightGrid([lamp], cached, 1024), cached);
    lamp.worldMatrix[12]++;
    const moved = cacheLightGrid([lamp], cached, 1024);
    assert.notEqual(moved, cached);
    lamp.extras.lights = [...lamp.extras.lights];
    assert.notEqual(cacheLightGrid([lamp], moved, 1024), moved);
    assert.equal(cacheLightGrid([], moved, 1024).count, 0);

    const headlight = { ...lamp, worldMatrix: [...matrix],
      extras: { lights: [...lamp.extras.lights], dynamicLights: true } };
    const root = { visible: true, children: [lamp, headlight] };
    const buffer = { size: 8192, writes: [] };
    const sun = { lights: buffer };
    const backend = { _layers: [{ options: { nightLight: true }, root }],
      renderer: { sunlight: sun, device: { limits: { maxStorageBufferBindingSize: 8192 },
        queue: { writeBuffer: recordLightUpload } } } };
    updatePointLights(backend);
    assert.equal(sun.lightCount, 2);
    assert.equal(buffer.writes.length, 2);
    const fixedGrid = sun.staticLightGrid;
    assert.equal(buffer.writes[0].data[6] * 16, buffer.writes[1].offset);
    buffer.writes.length = 0;
    updatePointLights(backend);
    assert.equal(buffer.writes.length, 0, 'Unchanged lights need no GPU upload');
    headlight.extras.lights = [...headlight.extras.lights];
    updatePointLights(backend);
    assert.equal(sun.staticLightGrid, fixedGrid, 'Moving headlights must not rebuild streetlights');
    assert.equal(buffer.writes.length, 1);
    assert.equal(buffer.writes[0].offset, fixedGrid.data.byteLength);
    headlight.visible = false;
    updatePointLights(backend);
    assert.equal(sun.lightCount, 1);
    assert.equal(sun.dynamicLightGrid.count, 0);
    lamp.visible = false;
    updatePointLights(backend);
    assert.equal(sun.lightCount, 0);
    assert.equal(sun.staticLightGrid.data[6], 2, 'An empty static grid still links to moving lights');
    lamp.visible = headlight.visible = true;
    updatePointLights(backend);
    assert.equal(sun.lightCount, 2, 'Re-enabled layers restore both grids');
    backend.renderer.device.limits.maxStorageBufferBindingSize = sun.staticLightGrid.data.byteLength;
    headlight.extras.lights = [...headlight.extras.lights];
    assert.throws(() => updatePointLights(backend), /GPU storage limit/);
  },

  terrain() {
    const tile = new Float32Array(65536).fill(NaN);
    tile[0] = 10; tile[1] = 20; tile[256] = 30; tile[257] = 40;
    const tiles = new Map([['0/0', tile]]);
    assert.equal(terrainElevation({ x: 1, y: 1 }, tiles), 25);
    tile[0] = NaN;
    assert.equal(terrainElevation({ x: 1, y: 1 }, tiles), 20);
    assert.equal(terrainElevation({ x: 1000, y: 1000 }, tiles), null);
    const bridges = new Map([['0/0', [{ min: [0, 0], max: [10, 10],
      triangles: [[[0, 0, 10], [10, 0, 20], [0, 10, 30]]] }]]]);
    assert.equal(bridgeElevation({ x: 2, y: 3 }, bridges), 18);
    assert.equal(bridgeElevation({ x: 9, y: 9 }, bridges), null);
    const grid = terrainGrid(2);
    assert.equal(grid.position.data.length, 27);
    assert.equal(grid.index.data.length, 24);
    assert.ok([...grid.index.data].every(index => index < 9));
    const atlas = terrainAtlas(tiles, { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } });
    assert.deepEqual([atlas.elevations[0], atlas.low, atlas.high], [-1e9, 20, 40]);
  },

  traffic() {
    const lanes = toLanes({ features: [{ geometry: { type: 'MultiLineString', coordinates: [
      [[2, 48], [3, 49]], [[4, 50], [5, 51]],
    ] }, properties: { flow: 3600, elevation: 7 } }] });
    assert.deepEqual(lanes[0].latlngs, [[48, 2], [49, 3]]);
    assert.equal(lanes[1].elevation, 7);
    const lane = { ...lanes[0], points: [[0, 0, 7], [30, 0, 7]], lengths: [0, 30], length: 30 };
    assert.equal(tripsAt(new Date(0), [lane], 10).length, 3);
    assert.deepEqual(tripsAt(new Date(1000), [lane], 10).map(trip => trip.distance), [15, 25, 5]);
    const route = routeGeometry([lane]);
    assert.equal(route.position.length, 18);
    assert.equal(route.color.length, route.normal.length);
    assert.ok(route.position.every(Number.isFinite));
  },

  walking() {
    const vertices = [0, 0, -1, 0, 2, -1, 0, 0, 1];
    assert.equal(horizontalRay(vertices, 0, -1, 0.5, 0, 1, 0), 1);
    assert.equal(horizontalRay(vertices, 0, -1, 3, 0, 1, 0), -1);
    const mesh = { ...emptyNode(), program: {}, geometry: { attributes: { position: { data: vertices } } } };
    const walls = collider(mesh);
    assert.equal(walls.tri.length, 9);
    assert.equal(collider(mesh), walls);
    assert.ok(walls.cells.size > 0);
  },

  shaders() {
    const plain = materialShaders();
    assert.deepEqual(plain.bindings, []);
    assert.equal(plain.textured, undefined);
    assert.match(plain.fragment, /textureSampleCompareLevel/);
    const textured = materialShaders({ baseTexture: { srgb: true }, roofTexture: true, terrain: {} }, true, 'fn elevation() {}');
    assert.deepEqual(textured.bindings, [
      { name: 'baseTexture', texture: 3, sampler: 4 }, { name: 'roofTexture', texture: 5, sampler: 6 },
    ]);
    assert.match(textured.vertex, /fn elevation\(\)/);
    assert.match(textured.fragment, /input.localPosition/);
    assert.equal(textured.hasTerrain, true);
    assert.match(plain.fragment, /appearance\(input.position.xy\)/);
    const mesh = (id, depth, transparent = false) => ({ id, _sortDepth: depth, program: { transparent } });
    const far = mesh(1, 0.9), near = mesh(2, 0.1);
    const glassNear = mesh(3, 0.2, true), glassFar = mesh(4, 0.8, true);
    const ground = { ...mesh(5, 1, true), ground: true, tile: { coords: { z: 17 } } };
    const preview = { ...mesh(6, 1, true), ground: true, tile: { coords: { z: 15 } } };
    assert.deepEqual(sortMeshes([far, glassNear, ground, near, glassFar, preview]).map(mesh => mesh.id),
      [6, 5, 2, 1, 4, 3]);
  },

  sky() {
    const size = { x: 800, y: 600 };
    assert.deepEqual(projectCelestialBody([0, 0, -1], size, Math.PI / 2, 0), { left: 400, top: 300 - 900 * Math.cos(Math.PI / 2) });
    assert.equal(projectCelestialBody([0, 0, 1], size, Math.PI / 2, 0), null);
  },
};

function recordLightUpload(buffer, offset, data) {
  buffer.writes.push({ offset, data: data.slice() });
}

Then('the standalone 3D {string} utilities preserve their results and errors', async function (domain) {
  await checks[domain]();
});

Then('standalone browser math preserves scene transforms and picking', async function () {
  const result = await this.page.evaluate(async base => {
    const [{ emptyNode }, { setParent }, { updateWorldMatrix }, { updateCamera }, { intersectMeshes }] = await Promise.all([
      import(`${base}/src/scene/emptyNode.js`),
      import(`${base}/src/scene/setParent.js`),
      import(`${base}/src/scene/updateWorldMatrix.js`),
      import(`${base}/src/scene/updateCamera.js`),
      import(`${base}/src/collision/intersectMeshes.js`),
    ]);
    const parent = emptyNode(), child = emptyNode();
    parent.position = [10, 20, 30];
    parent.scale = [2, 3, 4];
    child.position = [1, 2, 3];
    setParent(child, parent);
    updateWorldMatrix(parent);
    const position = child.worldMatrix.slice(12, 15);
    const version = child._worldMatrixVersion;
    updateWorldMatrix(parent);
    const cached = version === child._worldMatrixVersion;
    parent.position[0] += 5;
    updateWorldMatrix(parent);
    const updated = child.worldMatrix[12] === 17 && child._worldMatrixVersion > version;
    const camera = {
      position: [0, 0, 0], target: [0, 0, -1], up: [0, 1, 0], fov: 60, aspect: 1, near: 1, far: 100,
      viewMatrix: [], projectionMatrix: [], projectionViewMatrix: [],
    };
    updateCamera(camera);
    const project = z => {
      const point = new DOMPoint(0, 0, z, 1).matrixTransform(new DOMMatrix(camera.projectionViewMatrix));
      return point.z / point.w;
    };
    const mesh = z => ({
      ...emptyNode(), position: [0, 0, z], program: { cullFace: null },
      geometry: { attributes: { position: { size: 3, count: 3, data: [-1, -1, 0, 1, -1, 0, 0, 1, 0] } } },
    });
    const near = mesh(-5), far = mesh(-10);
    updateWorldMatrix(near);
    updateWorldMatrix(far);
    const ray = { origin: [0, 0, 0], direction: [0, 0, -1] };
    const hits = intersectMeshes(ray, [far, near]);
    near.program = { cullMode: 'none' };
    const backfaceHits = intersectMeshes({ origin: [0, 0, -10], direction: [0, 0, 1] }, [near]).length;
    near.program.nightLight = true;
    near.geometry.attributes.uv = { data: [0, 0, 0, 0, 0, 0] };
    const dayHits = intersectMeshes(ray, [near]).length;
    const nightHits = intersectMeshes(ray, [near], 1).length;
    return {
      position, cached, updated, projection: [project(-1), project(-100)],
      hits: hits.map(hit => ({ distance: hit.distance, point: hit.point, faceIndex: hit.faceIndex })),
      dayHits, nightHits, backfaceHits,
    };
  }, this.baseUrl);
  assert.deepEqual(result.position, [12, 26, 42]);
  assert.equal(result.cached, true);
  assert.equal(result.updated, true);
  assert.ok(Math.abs(result.projection[0]) < 1e-10);
  assert.ok(Math.abs(result.projection[1] - 1) < 1e-10);
  assert.deepEqual(result.hits, [
    { distance: 5, point: [0, 0, -5], faceIndex: 0 },
    { distance: 10, point: [0, 0, -10], faceIndex: 0 },
  ]);
  assert.deepEqual([result.dayHits, result.nightHits], [0, 1]);
  assert.equal(result.backfaceHits, 1);
});
