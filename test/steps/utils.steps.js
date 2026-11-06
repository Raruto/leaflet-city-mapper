import * as globals from '../fixtures/globals.js';
import { mockLeaflet } from '../fixtures/leaflet.js';


import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { Then } from '@cucumber/cucumber';
import { startServer } from '../../build/server.js';

Then('every demo data file fits the GitHub upload size limit', async function () {
  const directory = fileURLToPath(new URL('../../examples/data/', import.meta.url));
  const limit = 100 * 1024 * 1024, oversized = [];
  for (const name of await readdir(directory, { recursive: true })) {
    const info = await stat(join(directory, name));
    if (info.isFile() && info.size > limit) oversized.push(`${name}: ${info.size} bytes (limit ${limit})`);
  }
  assert.deepEqual(oversized, [], 'Demo data files must fit the GitHub 100 MiB per-file Git limit');
});

import { parseColor } from '../../src/colors/parseColor.js';
import { triangulate } from '../../src/triangulation/triangulate.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';
import { setVertexColor } from '../../src/geometry/setVertexColor.js';
import { treeGeometry } from '../../src/geometry/treeGeometry.js';
import { lightGeometry } from '../../src/geometry/lightGeometry.js';
import { lampPostGeometry } from '../../src/geometry/lampPostGeometry.js';
import { emptyNode } from '../../src/scene/createSceneNode.js';
import { setParent } from '../../src/scene/setParent.js';
import { traverse } from '../../src/scene/traverse.js';
import { decodeDirectory } from '../../src/archives/decodeDirectory.js';
import { getZxy } from '../../src/archives/getZxy.js';
import { loadSource } from '../../src/archives/loadSource.js';
import { read as readArchive } from '../../src/archives/readArchiveRange.js';
import { decodeHeader } from '../../src/archives/decodeHeader.js';
import { decompress } from '../../src/archives/decompress.js';
import { tileId } from '../../src/archives/tileId.js';
import { varint } from '../../src/archives/readVarint.js';
import { decodeModel } from '../../src/models/decodeModel.js';
import { loadModel } from '../../src/models/loadModel.js';
import { readAccessor } from '../../src/models/readAccessor.js';
import { nodeMatrix } from '../../src/transforms/modelNodeMatrix.js';
import { vertexNormals } from '../../src/geometry/vertexNormals.js';
import { textureSampler } from '../../src/textures/modelTextureSampler.js';
import { lightGrid } from '../../src/lighting/lightGrid.js';
import { cacheLightGrid } from '../../src/lighting/cacheLightGrid.js';
import { updatePointLights } from '../../src/lighting/updatePointLights.js';
import { worldLights } from '../../src/lighting/worldLights.js';
import { bridgeElevation } from '../../src/geometry/bridgeElevation.js';
import { terrainElevation } from '../../src/terrain/terrainElevation.js';
import { terrainGrid } from '../../src/geometry/terrainGrid.js';
import { terrainAtlas } from '../../src/terrain/terrainAtlas.js';
import { toLanes } from '../../src/traffic/featuresToTrafficLanes.js';
import { tripsAt } from '../../src/traffic/tripsAt.js';
import { routeGeometry } from '../../src/geometry/routeGeometry.js';
import { collider } from '../../src/collision/collider.js';
import { horizontalRay } from '../../src/collision/horizontalRay.js';
import { materialShaders } from '../../src/shaders/materialShaders.js';
import { sortMeshes } from '../../src/rendering/sortMeshes.js';
import { projectCelestialBody } from '../../src/projections/projectCelestialBody.js';
import { atmosphere } from '../../src/sunlight/atmosphere.js';
import { mix } from '../../src/colors/mixColor.js';
import { rgb } from '../../src/colors/formatRGB.js';
import { updateSky } from '../../src/sunlight/updateSky.js';
import { updateSun } from '../../src/sunlight/updateSun.js';
import { useSelectedTime } from '../../src/sunlight/useSelectedTime.js';
import { useLiveTime } from '../../src/sunlight/useLiveTime.js';
import { removeSun } from '../../src/sunlight/removeSun.js';
import { styleTimeControl } from '../../src/sunlight/styleTimeControl.js';
import { roofCoverage } from '../../src/geometry/roofCoverage.js';
import { box } from '../../src/geometry/box.js';
import { build } from '../../src/geometry/buildGeometryParts.js';
import { clipLine } from '../../src/geometry/clipLine.js';
import { clipSegment } from '../../src/geometry/clipSegment.js';
import { cross } from '../../src/geometry/crossVector.js';
import { sub } from '../../src/geometry/subtractVector.js';
import { below } from '../../src/geometry/offsetBelowGround.js';
import { materialFor } from '../../src/materials/modelMaterialFor.js';
import { loadBuffer } from '../../src/models/loadBuffer.js';
import { loadImage } from '../../src/textures/loadModelImage.js';
import { carModel } from '../../src/vehicles/carModel.js';
import { boatModel } from '../../src/vehicles/boatModel.js';
import { bicycleModel } from '../../src/vehicles/bicycleModel.js';
import { pedestrianModel } from '../../src/vehicles/pedestrianModel.js';
import { busModel } from '../../src/vehicles/busModel.js';
import { tramModel } from '../../src/vehicles/tramModel.js';
import { metroModel } from '../../src/vehicles/metroModel.js';
import { sortHits } from '../../src/collision/sortHits.js';
import { addBridges } from '../../src/geometry/addBridges.js';
import { quad } from '../../src/geometry/quad.js';
import { ring as lampRing } from '../../src/geometry/createLampRing.js';
import { ring as treeRing } from '../../src/geometry/createTreeRing.js';

Then('the build generates readable and minified bundles and standalone compatibility files', async function () {
  const load = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
  const [minified, readable, bindings, minifiedBindings] = await Promise.all([
    'dist/leaflet-city-mapper.js', 'dist/leaflet-city-mapper-src.js',
    'libs/openlayers-bindings.js', 'libs/openlayers-bindings.min.js',
  ].map(load));
  for (const source of [minified, readable, bindings, minifiedBindings]) assert.doesNotThrow(() => new Script(source));
  assert.ok(readable.length > minified.length);
  assert.ok(readable.split('\n').length > minified.split('\n').length * 10);
  assert.ok(minifiedBindings.length < bindings.length);
  for (const source of [bindings, minifiedBindings]) {
    assert.ok(source.includes('.ol-city-tooltip'));
    assert.ok(source.includes('openlayersBindings'));
  }
  for (const path of ['dist/leaflet-city-mapper.js', 'dist/leaflet-city-mapper-src.js',
    'libs/openlayers-bindings.min.js']) {
    const source = await load(path), map = JSON.parse(await load(`${path}.map`));
    assert.ok(source.includes(`sourceMappingURL=${path.split('/').pop()}.map`));
    assert.ok(map.sources.length > 0);
    assert.equal(map.sources.length, map.sourcesContent.length);
    assert.ok(map.sources.every(name => path.startsWith('dist/') ? name.startsWith('../src/') : !name.includes('examples/')));
    if (path.startsWith('dist/')) {
      assert.ok(map.sources.every(name => !name.includes('openlayers-bindings')));
      assert.ok(map.sourcesContent.some(content => content.includes('/* wgsl */')));
    }
  }
});

Then('preallocated geometry arrays retain their shape and ownership', function () {
  for (const [ring, directions] of [[lampRing, globals.lampDirections], [treeRing, globals.ringDirections]]) {
    const point = { x: 10, y: -3, ground: 4 };
    const first = ring(point, 2), second = ring(point, 2);
    assert.equal(first.length, directions.length);
    assert.notEqual(first, second);
    for (let i = 0; i < first.length; i++) {
      assert.ok(Object.hasOwn(first, i));
      assert.equal(first[i].x, point.x + directions[i].x * 2);
      assert.equal(first[i].y, point.y + directions[i].y * 2);
      assert.equal(first[i].ground, point.ground);
      assert.notEqual(first[i], second[i]);
      if (ring === lampRing) {
        assert.deepEqual(first[i].uv, [3, 3]);
        assert.notEqual(first[i].uv, second[i].uv);
      }
    }
    first[0].x = 99;
    assert.notEqual(second[0].x, 99);
  }
  for (const [a, b] of [[[], []], [[3], [1]], [[3, 5, 8, 13], [1, 2, 3, 5]]]) {
    const first = sub(a, b), second = sub(a, b);
    assert.equal(first.length, a.length);
    assert.deepEqual(first, a.map((value, i) => value - b[i]));
    assert.notEqual(first, second);
  }
  const geometry = { attributes: { position: { data: [-2, -4, -6, 4, 8, 12] } } };
  computeBounds(geometry);
  assert.deepEqual(geometry.bounds.center, [1, 2, 3]);
  const center = geometry.bounds.center;
  computeBounds(geometry);
  assert.notEqual(geometry.bounds.center, center);
  assert.deepEqual(center, [1, 2, 3]);
});

Then('precomputed constants match their original numeric formulas', function () {
  assert.equal(globals.radians, Math.PI / 180);
  assert.equal(globals.degrees, 180 / Math.PI);
  assert.equal(globals.halfRadians, Math.PI / 360);
  assert.equal(globals.tau, 2 * Math.PI);
  assert.equal(globals.earthCirc, 40075016.68557849);
  assert.ok(Math.abs(globals.cameraFov - 2 * Math.atan(1 / 3) * 180 / Math.PI) < 1e-12);
  assert.equal(globals.sinObliquity, Math.sin(23.4397 * Math.PI / 180));
  assert.equal(globals.cosObliquity, Math.cos(23.4397 * Math.PI / 180));
  for (const angle of [-720, -180, -90, -1, 0, 1, 45, 90, 180, 360, 720]) {
    assert.ok(Math.abs(angle * globals.radians - angle * Math.PI / 180) < 1e-12);
    assert.ok(Math.abs(angle * globals.degrees - angle * 180 / Math.PI) < 1e-10);
  }
  for (const flux of [0, 1, 4 * Math.PI, 1000, 100000]) {
    const expected = flux / (4 * Math.PI) * 0.03;
    assert.ok(Math.abs(flux * globals.lightScale - expected) <= Math.max(1, expected) * 1e-15);
  }
  assert.equal(globals.lampDirections.length, 6);
  for (const [i, direction] of globals.lampDirections.entries()) {
    assert.deepEqual(direction, {
      x: Math.cos(i * Math.PI / 3), y: Math.sin(i * Math.PI / 3),
      nx: Math.cos((i + 0.5) * Math.PI / 3), nz: -Math.sin((i + 0.5) * Math.PI / 3),
    });
  }
});

const checks = {
  'roof-coverage'() {
    const backend = {
      _sceneOrigin: { x: 0, y: 0, lat: 0 },
      _map: { project: point => Array.isArray(point) ? { x: point[1], y: point[0] } : point,
        options: { crs: { scale: () => 40075016.68557849 } } },
    };
    globals.sceneByLayer.set(backend, backend);
    globals.cameraByMap.set(backend._map, backend._map);
    const mesh = { geometry: { bounds: { min: [50, 0, 50], max: [300, 20, 300] } },
      worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
    const layer = { _tileZoom: 1, header: {}, _rasterTiles: new Map() };
    globals.sceneByLayer.set(layer, layer);
    assert.equal(roofCoverage(mesh, backend, [layer]), false);
    for (const [x, y] of [[0, 0], [1, 0], [0, 1]]) {
      globals.sceneByLayer.get(layer)._rasterTiles.set(`${x}/${y}`, { coords: { x, y, z: 1 }, done: true });
    }
    assert.equal(roofCoverage(mesh, backend, [layer]), false);
    globals.sceneByLayer.get(layer)._rasterTiles.set('1/1', { coords: { x: 1, y: 1, z: 1 }, done: true });
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    globals.sceneByLayer.get(layer)._rasterTiles = new Map([['parent', { coords: { x: 0, y: 0, z: 0 }, done: true }]]);
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    globals.sceneByLayer.get(layer)._rasterTiles.clear();
    globals.sceneByLayer.get(layer).header = { minLon: 400, maxLon: 500, maxLat: 400, minLat: 500 };
    assert.equal(roofCoverage(mesh, backend, [layer]), true);
    globals.sceneByLayer.get(layer).header = { minLon: 0, maxLon: 100, maxLat: 0, minLat: 100 };
    globals.sceneByLayer.get(layer)._rasterTiles.set('error', { coords: { x: 0, y: 0, z: 1 }, error: 'Reported tile error' });
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
    const uploads = [], innerUploads = [];
    const innerMesh = { geometry: { attributes: { color: { data: { set: rgb => innerUploads.push([...rgb]) } } } } };
    const outerMesh = { geometry: { attributes: { color: { data: { set(rgb) {
      setVertexColor(innerMesh, 0, 1, { r: 0, g: 1, b: 0 });
      uploads.push([...rgb]);
    } } } } } };
    setVertexColor(outerMesh, 0, 2, { r: 1, g: 0, b: 0 });
    assert.deepEqual(uploads, [[1, 0, 0], [1, 0, 0]], 'Reentrant color uploads cannot overwrite outer scratch');
    assert.deepEqual(innerUploads, [[0, 1, 0], [0, 1, 0]]);
    const point = { x: 0, y: 0, ground: 0 }, emitted = [];
    const add = (...triangle) => emitted.push(triangle);
    treeGeometry(point, { top: 10, trunkRadius: 0.2, crownRadius: 2, crownBottom: 3 }, add);
    lightGeometry(point, { top: 5, lightRadius: 10, color: 0xffffff }, add);
    lampPostGeometry(point, { top: 5, poleRadius: 0.1 }, add);
    assert.ok(emitted.length > 100);
    assert.ok(emitted.every(triangle => Object.values(triangle.at(-1)).every(Number.isFinite)));
    const savedTriangles = structuredClone(triangles);
    triangulate(outer);
    assert.deepEqual(triangles, savedTriangles, 'Later triangulations cannot mutate retained topology');
    const bounds = structuredClone(geometry.bounds), savedBounds = geometry.bounds;
    geometry.attributes.position.data[0] = -10;
    computeBounds(geometry);
    assert.deepEqual(savedBounds, bounds, 'Recomputed bounds cannot overwrite retained snapshots');

    const footprint = box(-1, 1, -2, 2), otherFootprint = box(-1, 1, -2, 2);
    otherFootprint[0][0] = 100;
    assert.deepEqual(footprint[0], [-1, -2]);
    const parts = [[footprint, 0, 3, [0.2, 0.4, 0.6]]];
    const built = build(parts), savedBuild = structuredClone(built);
    build([[otherFootprint, 1, 4, [1, 0, 0]]]);
    assert.deepEqual(built, savedBuild);
    assert.equal(built.position.length, 108);
    assert.ok(built.normal.every(Number.isFinite));
    for (const helper of [cross, sub]) {
      const first = helper([1, 2, 3], [3, 2, 1]), before = [...first];
      helper([0, 1, 0], [1, 0, 0])[0] = 99;
      assert.deepEqual(first, before, 'Vector helpers return independently owned results');
    }
    assert.deepEqual(below([1, 4, 3]), [1, 2.8, 3]);
    const vectorQuad = [], scalarQuad = [];
    quad((...triangle) => vectorQuad.push(triangle), {}, point, point, point, point, 5, [0, 1, 0]);
    quad((...triangle) => scalarQuad.push(triangle), {}, point, point, point, point, 5, 0, 1, 0);
    assert.deepEqual(scalarQuad, vectorQuad, 'Scalar emitter normals preserve the existing vector-normal quad API');
    const bounds2D = [0, 0, 10, 10], a = [-1, 5], b = [11, 5];
    const clipped = clipSegment(a, b, bounds2D);
    assert.deepEqual(clipped, [[0, 5], [10, 5]]);
    clipSegment(a, b, bounds2D)[0][0] = 99;
    assert.deepEqual(clipped, [[0, 5], [10, 5]]);
    assert.deepEqual([a, b], [[-1, 5], [11, 5]]);
    assert.equal(clipSegment([-1, 0], [-1, 10], bounds2D), null);
    assert.equal(clipSegment([0, 0], [0, 0], bounds2D), null);
    assert.deepEqual(clipLine([[-1, 5], [5, 5], [11, 5], [11, 20], [5, 5]], bounds2D),
      [[[0, 5], [5, 5], [10, 5]], [[7, 10], [5, 5]]]);

    for (const [emit, style] of [
      [treeGeometry, { top: 10, trunkRadius: 0.2, crownRadius: 2, crownBottom: 3 }],
      [lightGeometry, { top: 5, lightRadius: 10, color: 0xffffff }],
      [lampPostGeometry, { top: 5, poleRadius: 0.1 }],
    ]) {
      const baseline = [], reentrant = [], nested = [];
      emit(point, style, (...triangle) => baseline.push(triangle));
      emit(point, style, (...triangle) => {
        if (!reentrant.length) emit({ x: 100, y: 200, ground: 50 }, style, (...inner) => nested.push(inner));
        reentrant.push(triangle);
      });
      assert.deepEqual(reentrant, baseline, 'Nested geometry callbacks cannot overwrite outer vertices');
      const snapshot = structuredClone(reentrant);
      emit({ x: -100, y: -200, ground: -50 }, style, (...inner) => nested.push(inner));
      assert.deepEqual(reentrant, snapshot, 'Retained triangle vertices and UVs survive later geometry calls');
    }
    for (const make of [carModel, boatModel, bicycleModel, pedestrianModel, busModel, tramModel, metroModel]) {
      const first = make(0, {}), snapshot = structuredClone(first), other = make(1, {});
      other[make === pedestrianModel ? 1 : 0][1] = -999;
      assert.deepEqual(first, snapshot, 'Vehicle part descriptors must not alias later models');
      const firstMesh = build(first), before = structuredClone(firstMesh);
      build(other);
      assert.deepEqual(firstMesh, before, 'Built vehicle buffers remain independent');
      assert.ok(firstMesh.position.every(Number.isFinite));
      assert.ok(firstMesh.normal.every(Number.isFinite));
    }
    const originals = new Map(['GPUBufferUsage', 'GPUShaderStage'].map(name =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    const previousLeaflet = mockLeaflet({ LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } } });
    try {
      globalThis.GPUBufferUsage = { VERTEX: 1, COPY_DST: 2 };
      globalThis.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2 };
      const makeBackend = () => ({
        options: {}, location: { lat: 0, lng: 0 }, root: { ...emptyNode(), position: [0, 5, 0] }, _terrainZoom: 0,
        _map: { options: { crs: { project: point => ({ x: point.lng, y: point.lat }) } },
          project: ([lat, lng]) => ({ x: lng, y: lat }) },
        renderer: { sunlight: { layout: {} }, device: {
          createBuffer: descriptor => ({ ...descriptor }), queue: { writeBuffer() {} },
          createShaderModule: () => ({ getCompilationInfo: async () => ({ messages: [] }) }),
          createBindGroupLayout: () => ({}), createPipelineLayout: () => ({}),
        } },
      });
      const bridgeBackend = makeBackend(), secondBackend = makeBackend();
      globals.sceneByLayer.set(bridgeBackend, bridgeBackend);
      globals.sceneByLayer.set(secondBackend, secondBackend);
      globals.cameraByMap.set(bridgeBackend._map, bridgeBackend._map);
      globals.cameraByMap.set(secondBackend._map, secondBackend._map);
      const bridgeSource = { features: [{ geometry: { type: 'Polygon', coordinates: [
        [[0, 0, 20], [10, 0, 20], [10, 10, 20], [0, 10, 20], [0, 0, 20]],
      ] } }] };
      addBridges(bridgeBackend, bridgeSource);
      const bridgeState = globals.sceneByLayer.get(bridgeBackend), attributes = bridgeState._bridgeMesh.geometry.attributes;
      assert.equal(attributes.position.data.length, 108);
      assert.equal(bridgeElevation({ x: 5, y: 5 }, bridgeState._bridges), 20);
      const savedPositions = attributes.position.data.slice(), savedBridge = structuredClone(bridgeState._bridges);
      addBridges(secondBackend, bridgeSource);
      assert.deepEqual(attributes.position.data, savedPositions, 'Other backends cannot overwrite bridge mesh buffers');
      assert.deepEqual(bridgeState._bridges, savedBridge, 'Other backends cannot overwrite bridge terrain records');
      assert.notEqual(globals.sceneByLayer.get(secondBackend)._bridges.get('0/0')[0], bridgeState._bridges.get('0/0')[0]);
      for (let i = 0; i < attributes.position.data.length; i += 9) {
        const p = attributes.position.data.slice(i, i + 3), q = attributes.position.data.slice(i + 3, i + 6);
        const r = attributes.position.data.slice(i + 6, i + 9), n = cross(sub(q, p), sub(r, p));
        const normal = attributes.normal.data.slice(i, i + 3);
        assert.ok(n.reduce((dot, value, axis) => dot + value * normal[axis], 0) > 0,
          'Bridge top, underside and walls retain winding consistent with their normals');
      }
    } finally {
      mockLeaflet(previousLeaflet);
      for (const [name, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    }
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
    for (const [encoded, expected] of [[[0], 0], [[127], 127], [[128, 1], 128], [[255, 255, 255, 255, 255, 255, 255, 15], Number.MAX_SAFE_INTEGER]]) {
      const reader = { bytes: Uint8Array.from(encoded), cursor: 0 };
      assert.equal(varint(reader), expected);
      assert.equal(reader.cursor, encoded.length);
    }
    for (const encoded of [[128], [255, 255, 255, 255, 255, 255, 255, 16], [128, 128, 128, 128, 128, 128, 128, 128]]) {
      assert.throws(() => varint({ bytes: Uint8Array.from(encoded), cursor: 0 }), /Truncated PMTiles directory|Invalid PMTiles directory integer/);
    }
    const bytes = Uint8Array.from([2, 1, 3, 1, 1, 2, 3, 1, 0]);
    const firstDirectory = decodeDirectory(bytes.buffer);
    const reusedReader = globals.directoryReader;
    assert.equal(reusedReader.bytes, null, 'Shared reader must release successful inputs');
    assert.equal(reusedReader.cursor, 0);
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
      assert.equal(reusedReader.bytes, null, 'Shared reader must release malformed inputs');
      assert.equal(reusedReader.cursor, 0);
      assert.deepEqual(decodeDirectory(bytes.buffer), firstDirectory);
    }
    assert.deepEqual(decodeDirectory(Uint8Array.of(0).buffer), []);
    const count = 130;
    const encoded = Uint8Array.from([
      130, 1, ...new Array(count).fill(1), ...new Array(count).fill(1),
      ...new Array(count).fill(2), 1, ...new Array(count - 1).fill(0),
    ]);
    const sizedDirectory = decodeDirectory(encoded.buffer);
    assert.equal(sizedDirectory.length, count);
    for (let i = 0; i < count; i++) {
      assert.ok(Object.hasOwn(sizedDirectory, i), 'The preallocated array must have no uninitialized slots');
      assert.deepEqual(sizedDirectory[i], { tileId: i + 1, runLength: 1, length: 2, offset: i * 2 });
      assert.deepEqual(Object.keys(sizedDirectory[i]), ['tileId', 'runLength', 'length', 'offset']);
    }
    assert.deepEqual(firstDirectory, [
      { tileId: 1, runLength: 1, length: 2, offset: 0 },
      { tileId: 4, runLength: 1, length: 3, offset: 2 },
    ], 'Later calls must not mutate previous directories');
    assert.notEqual(decodeDirectory(bytes.buffer), firstDirectory);
    const secondDirectory = decodeDirectory(bytes.buffer);
    assert.equal(globals.directoryReader, reusedReader, 'Synchronous decodes must reuse the reader');
    assert.notEqual(secondDirectory[0], secondDirectory[1]);
    assert.notEqual(secondDirectory[0], firstDirectory[0]);
    secondDirectory[0].length = 99;
    assert.equal(firstDirectory[0].length, 2, 'Directory entries must not alias earlier results');
    assert.equal(secondDirectory[1].length, 3, 'Entries in one directory must not alias each other');
    const data = new ArrayBuffer(127), view = new DataView(data);
    new Uint8Array(data).set(new TextEncoder().encode('PMTiles'));
    view.setUint8(7, 3);
    assert.throws(() => decodeHeader(new ArrayBuffer(127)), /Expected a PMTiles v3 archive/);
    assert.throws(() => decodeHeader(new ArrayBuffer(8)), /Expected a PMTiles v3 archive/);
    view.setBigUint64(8, 127n, true);
    view.setUint8(100, 4);
    assert.equal(decodeHeader(data).rootDirectoryOffset, 127);
    assert.equal(decodeHeader(data).minZoom, 4);
    const headerData = data.slice(0), headerView = new DataView(headerData);
    const expectedHeader = {};
    for (const [i, name] of [
      'rootDirectoryOffset', 'rootDirectoryLength', 'jsonMetadataOffset', 'jsonMetadataLength',
      'leafDirectoryOffset', 'leafDirectoryLength', 'tileDataOffset', 'tileDataLength',
      'numAddressedTiles', 'numTileEntries', 'numTileContents',
    ].entries()) {
      expectedHeader[name] = 1000 + i;
      headerView.setBigUint64(8 + i * 8, BigInt(expectedHeader[name]), true);
    }
    for (const [i, name] of [
      'clustered', 'internalCompression', 'tileCompression', 'tileType', 'minZoom', 'maxZoom',
    ].entries()) {
      expectedHeader[name] = i + 1;
      headerView.setUint8(96 + i, expectedHeader[name]);
    }
    for (const [i, name] of ['minLon', 'minLat', 'maxLon', 'maxLat'].entries()) {
      expectedHeader[name] = i - 2;
      headerView.setInt32(102 + i * 4, expectedHeader[name] * 1e7, true);
    }
    headerView.setUint8(118, 12);
    headerView.setInt32(119, 23456789, true);
    headerView.setInt32(123, 487654321, true);
    Object.assign(expectedHeader, { centerZoom: 12, centerLon: 2.3456789, centerLat: 48.7654321 });
    const firstHeader = decodeHeader(headerData);
    assert.deepEqual(firstHeader, expectedHeader);
    assert.deepEqual(decodeHeader(headerData), expectedHeader, 'Repeated calls must reset all reused counters');
    const otherHeader = decodeHeader(data);
    assert.notEqual(otherHeader, firstHeader, 'Archives must own independent headers');
    assert.equal(otherHeader.rootDirectoryOffset, 127);
    otherHeader.minZoom = 99;
    assert.deepEqual(firstHeader, expectedHeader, 'Decoding and mutating another archive must not change earlier results');
    for (let i = 0; i < 8; i++) {
      const invalid = headerData.slice(0);
      new Uint8Array(invalid)[i] ^= 0xff;
      assert.throws(() => decodeHeader(invalid), /Expected a PMTiles v3 archive/);
    }
    assert.deepEqual(decodeHeader(headerData), expectedHeader, 'Invalid signatures must not poison later decodes');
    assert.equal(await decompress(data, 1), data);
    assert.equal(new TextDecoder().decode(await decompress(gzipSync('utility'), 2)), 'utility');
    const inflated = await Promise.all(['first', 'second'].map(text => decompress(gzipSync(text), 2)));
    assert.deepEqual(inflated.map(buffer => new TextDecoder().decode(buffer)), ['first', 'second']);
    await assert.rejects(decompress(Uint8Array.of(0).buffer, 2));
    await assert.rejects(decompress(data, 3), /Unsupported PMTiles compression/);
    const archive = {
      options: {}, _directories: new Map(),
      _header: Promise.resolve({
        minZoom: 0, maxZoom: 0, rootDirectoryOffset: 0, rootDirectoryLength: 5,
        tileDataOffset: 5, tileDataLength: 1, internalCompression: 1, tileCompression: 1,
      }),
      url: `data:application/octet-stream;base64,${Buffer.from([128, 128, 128, 128, 128, 42]).toString('base64')}`,
    };
    globals.sceneByLayer.set(archive, archive);
    await assert.rejects(getZxy(archive, 0, 0, 0), /Truncated PMTiles directory/);
    assert.equal(globals.sceneByLayer.get(archive)._directories.size, 0, 'Failed directory reads must be retryable');
    globals.sceneByLayer.get(archive).url = `data:application/octet-stream;base64,${Buffer.from([1, 0, 1, 1, 1, 42]).toString('base64')}`;
    const tiles = await Promise.all([getZxy(archive, 0, 0, 0), getZxy(archive, 0, 0, 0)]);
    for (const tile of tiles) assert.deepEqual([...new Uint8Array(tile.data)], [42]);
    assert.notEqual(tiles[0], tiles[1]);
    assert.notEqual(tiles[0].data, tiles[1].data);
    assert.equal(globals.sceneByLayer.get(archive)._directories.size, 1, 'Concurrent reads must share the directory cache');
    let rejectDirectory;
    globals.sceneByLayer.get(archive)._directories.set('0:5', new Promise((resolve, reject) => { rejectDirectory = reject; }));
    const pending = getZxy(archive, 0, 0, 0);
    await Promise.resolve();
    const replacement = Promise.resolve([{ tileId: 0, runLength: 1, length: 1, offset: 0 }]);
    globals.sceneByLayer.get(archive)._directories.set('0:5', replacement);
    rejectDirectory(new Error('Evicted directory failed'));
    await assert.rejects(pending, /Evicted directory failed/);
    assert.equal(globals.sceneByLayer.get(archive)._directories.get('0:5'), replacement, 'An evicted request must not delete its replacement');
    for (const cycle of [0, 1, 2, null]) {
      const traversal = {
        options: {},
        _header: Promise.resolve({
          minZoom: 0, maxZoom: 0, rootDirectoryOffset: 0, rootDirectoryLength: 1,
          leafDirectoryOffset: 0, leafDirectoryLength: 10,
        }),
        _directories: new Map(),
      };
      globals.sceneByLayer.set(traversal, traversal);
      for (let depth = 0; depth < 4; depth++) {
        traversal._directories.set(`${depth}:1`, Promise.resolve([{
          tileId: 0, runLength: 0, length: 1,
          offset: depth === 2 && cycle !== null ? cycle : depth + 1,
        }]));
      }
      await assert.rejects(getZxy(traversal, 0, 0, 0),
        cycle === null ? /depth exceeds four levels/ : /Cyclic PMTiles directory/);
    }
    const emptyArchive = { options: {}, _header: Promise.resolve({ minZoom: 1, maxZoom: 1 }) };
    globals.sceneByLayer.set(emptyArchive, emptyArchive);
    const area = { coords: { z: 0, x: 0, y: 0 }, request: new AbortController() };
    const emptySources = await Promise.all([loadSource(emptyArchive, area), loadSource(emptyArchive, area)]);
    assert.deepEqual(emptySources[0], { type: 'FeatureCollection', features: [] });
    assert.notEqual(emptySources[0], emptySources[1]);
    assert.notEqual(emptySources[0].features, emptySources[1].features);
    emptySources[0].features.push({ type: 'Feature' });
    assert.deepEqual(emptySources[1].features, [], 'Empty source results must not share feature arrays');
    const inline = { _geojson: true, options: { data: emptySources[1] } };
    globals.sceneByLayer.set(inline, inline);
    assert.equal(await loadSource(inline, area), emptySources[1]);
  },

  async 'archive-requests'() {
    const originalFetch = globalThis.fetch;
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const requests = [];
    try {
      globalThis.document = { baseURI: 'https://example.test/' };
      globalThis.fetch = async (url, options) => {
        await Promise.resolve();
        requests.push({ url: String(url), options });
        options.signal?.throwIfAborted();
        return new Response(JSON.stringify({ type: 'FeatureCollection', features: [], url: String(url) }));
      };
      const areas = [new AbortController(), new AbortController()].map(request => ({ request }));
      const sources = ['first.json', 'second.json'].map(url => ({ _geojson: true, options: { url } }));
      for (const source of sources) globals.sceneByLayer.set(source, source);
      const loaded = await Promise.all(sources.map((source, i) => loadSource(source, areas[i])));
      assert.deepEqual(loaded.map(source => source.url), ['https://example.test/first.json', 'https://example.test/second.json']);
      assert.notEqual(requests[0].options, requests[1].options);
      assert.equal(requests[0].options.signal, areas[0].request.signal);
      assert.equal(requests[1].options.signal, areas[1].request.signal);
      const missing = { _geojson: true, options: {} }, ambiguous = { _geojson: true, options: { data: {}, url: 'both.json' } };
      globals.sceneByLayer.set(missing, missing);
      globals.sceneByLayer.set(ambiguous, ambiguous);
      await assert.rejects(loadSource(missing, areas[0]), /requires either data or url/);
      await assert.rejects(loadSource(ambiguous, areas[0]), /requires either data or url/);
      globalThis.fetch = async () => new Response('', { status: 404 });
      await assert.rejects(loadSource(sources[0], areas[0]), /Unable to load GeoJSON: HTTP 404/);
      const unavailable = { url: 'missing' };
      globals.sceneByLayer.set(unavailable, unavailable);
      await assert.rejects(readArchive(unavailable, 0, 1), /Unable to read PMTiles: HTTP 404/);
      requests.length = 0;
      globalThis.fetch = async (url, options) => {
        await Promise.resolve();
        requests.push({ url, options });
        options.signal?.throwIfAborted();
        const range = options.headers.Range.slice(6);
        const [start, end] = range.split('-').map(Number);
        return new Response(Uint8Array.from({ length: end - start + 1 }, (_, i) => start + i), {
          status: 206, headers: { 'Content-Range': `bytes ${range}/127`, ETag: '"stable"' },
        });
      };
      const backend = { url: 'https://example.test/archive.pmtiles' };
      globals.sceneByLayer.set(backend, backend);
      const ranges = await Promise.all([
        readArchive(backend, 0, 2, areas[0].request.signal),
        readArchive(backend, 4, 3, areas[1].request.signal),
      ]);
      assert.deepEqual(ranges.map(buffer => [...new Uint8Array(buffer)]), [[0, 1], [4, 5, 6]]);
      assert.notEqual(requests[0].options, requests[1].options);
      assert.notEqual(requests[0].options.headers, requests[1].options.headers);
      assert.equal(requests[0].options.signal, areas[0].request.signal);
      assert.equal(requests[1].options.signal, areas[1].request.signal);
      areas[0].request.abort();
      await assert.rejects(readArchive(backend, 0, 1, areas[0].request.signal), { name: 'AbortError' });
      for (const [offset, length] of [[-1, 1], [0, 0], [0.5, 1], [Number.MAX_SAFE_INTEGER, 1]]) {
        await assert.rejects(readArchive(backend, offset, length), /Invalid PMTiles byte range/);
      }
      globalThis.fetch = async () => new Response(Uint8Array.of(1), {
        status: 206, headers: { 'Content-Range': 'bytes 0-0/127', ETag: '"changed"' },
      });
      await assert.rejects(readArchive(backend, 0, 1), /archive changed/);
      delete globals.sceneByLayer.get(backend)._etag;
      await assert.rejects(readArchive(backend, 1, 1), /Invalid PMTiles range response/);
      globalThis.fetch = async () => new Response(Uint8Array.of(1), {
        status: 206, headers: { 'Content-Range': 'bytes 0-1/127' },
      });
      delete globals.sceneByLayer.get(backend)._etag;
      await assert.rejects(readArchive(backend, 0, 2), /Truncated PMTiles range/);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else delete globalThis.document;
    }
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
    const retainedAccessor = readAccessor(model, 0);
    readAccessor(model, 0).data[0] = 99;
    assert.deepEqual([...retainedAccessor.data], [1, 2, 3, 4], 'Accessor results own their decoded buffers');
    for (const [componentType, Type, values] of [
      [5120, Int8Array, [-128, 127]], [5121, Uint8Array, [0, 255]],
      [5122, Int16Array, [-32768, 32767]], [5123, Uint16Array, [0, 65535]],
      [5125, Uint32Array, [0, 4294967295]], [5126, Float32Array, [1.5, -2.25]],
    ]) {
      const buffer = new ArrayBuffer(2 + 2 * Type.BYTES_PER_ELEMENT), view = new DataView(buffer);
      const setter = Type === Int8Array ? 'setInt8' : Type === Uint8Array ? 'setUint8' :
        Type === Int16Array ? 'setInt16' : Type === Uint16Array ? 'setUint16' :
          Type === Uint32Array ? 'setUint32' : 'setFloat32';
      for (let i = 0; i < values.length; i++) view[setter](2 + i * Type.BYTES_PER_ELEMENT, values[i], true);
      const accessor = readAccessor({
        buffers: [{ binary: buffer }], bufferViews: [{ buffer: 0, byteLength: buffer.byteLength }],
        accessors: [{ bufferView: 0, byteOffset: 2, componentType, count: 2, type: 'SCALAR' }],
      }, 0);
      assert.deepEqual([...accessor.data], [...Float32Array.from(values)], 'Accessor reads must handle every component type and unaligned byte offsets');
    }
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
    const identity = nodeMatrix({});
    nodeMatrix({})[0] = 99;
    assert.deepEqual(identity, emptyNode().worldMatrix, 'Default node transforms remain independent');
    const normals = vertexNormals([0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]);
    vertexNormals([0, 0, 0, 0, 0, 0, 0, 0, 0])[0] = 99;
    assert.deepEqual([...normals], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const styleContext = { backend: { options: {} } }, style = materialFor(styleContext, {});
    materialFor(styleContext, {}).color[0] = 99;
    materialFor(styleContext, {}).emissive[0] = 99;
    assert.deepEqual(style.color, [1, 1, 1]);
    assert.deepEqual(style.emissive, [0, 0, 0]);
    assert.deepEqual(textureSampler({ wrapS: 33071, wrapT: 33648, magFilter: 9728, minFilter: 9986 }),
      { addressModeU: 'clamp-to-edge', addressModeV: 'mirror-repeat', magFilter: 'nearest', minFilter: 'nearest' });
    const originalFetch = globalThis.fetch;
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const root = emptyNode();
    const backend = {
      _added: { promise: Promise.resolve() }, modelUrl: 'model.gltf', root, options: {},
    };
    globals.sceneByLayer.set(backend, backend);
    try {
      globalThis.document = { baseURI: 'https://example.test/' };
      globalThis.fetch = async () => new Response(JSON.stringify({
        asset: { version: '2.0' }, scenes: [{ nodes: [0] }], nodes: [{}],
      }));
      await loadModel(backend);
      assert.equal(globals.sceneByLayer.get(backend).model.id, 'https://example.test/model.gltf');
      assert.equal(globals.sceneByLayer.get(backend).model.parent, root);
      assert.equal(root.children[0], globals.sceneByLayer.get(backend).model);
      assert.equal(globals.sceneByLayer.get(backend).model.children.length, 1);
      const another = { _added: { promise: Promise.resolve() }, modelUrl: 'other.gltf', root: emptyNode(), options: {} };
      globals.sceneByLayer.set(another, another);
      await Promise.all([loadModel(backend), loadModel(another)]);
      assert.notEqual(globals.sceneByLayer.get(backend).model, globals.sceneByLayer.get(another).model);
      assert.notEqual(globals.sceneByLayer.get(backend).model.extras, globals.sceneByLayer.get(another).model.extras);
      assert.notEqual(globals.sceneByLayer.get(backend).model.children[0].matrix, globals.sceneByLayer.get(another).model.children[0].matrix);
      globalThis.fetch = async url => new Response(Uint8Array.of(url.endsWith('first.bin') ? 1 : 2));
      const buffers = [{ uri: 'first.bin' }, { uri: 'second.bin' }];
      await Promise.all(buffers.map(buffer => loadBuffer(buffer, 'https://example.test/')));
      assert.deepEqual(buffers.map(buffer => [...new Uint8Array(buffer.binary)]), [[1], [2]]);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else delete globalThis.document;
    }
    const originalBitmap = Object.getOwnPropertyDescriptor(globalThis, 'createImageBitmap');
    try {
      globalThis.createImageBitmap = async (blob, options) => {
        await Promise.resolve();
        return { bytes: [...new Uint8Array(await blob.arrayBuffer())], type: blob.type, options: { ...options } };
      };
      const description = { buffers: [{ binary: Uint8Array.of(1, 2).buffer }],
        bufferViews: [{ buffer: 0, byteLength: 1 }, { buffer: 0, byteOffset: 1, byteLength: 1 }] };
      const images = await Promise.all([0, 1].map(bufferView => loadImage(description, '', { bufferView, mimeType: 'image/png' })));
      assert.deepEqual(images.map(image => image.bytes), [[1], [2]]);
      assert.deepEqual(images.map(image => image.type), ['image/png', 'image/png']);
      assert.deepEqual(images[0].options, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    } finally {
      if (originalBitmap) Object.defineProperty(globalThis, 'createImageBitmap', originalBitmap);
      else delete globalThis.createImageBitmap;
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
    assert.deepEqual(cached.data, data, 'Moving a mesh cannot overwrite a retained light grid');
    const emptyFirst = lightGrid([], 32), emptySecond = lightGrid([], 32);
    emptyFirst.data[6] = 99;
    assert.equal(emptySecond.data[6], 0, 'Empty grids need independent mutable upload headers');
    assert.notEqual(worldLights(lamp.extras.lights, matrix), values);
    lamp.extras.lights = [...lamp.extras.lights];
    assert.notEqual(cacheLightGrid([lamp], moved, 1024), moved);
    assert.equal(cacheLightGrid([], moved, 1024).count, 0);
    const otherLamp = { ...lamp, worldMatrix: [...matrix] };
    const lamps = [lamp, otherLamp];
    const combined = cacheLightGrid(lamps, undefined, 4096);
    assert.equal(combined.meshes.length, lamps.length);
    assert.deepEqual(combined.meshes.map(snapshot => snapshot.mesh), lamps);
    assert.deepEqual(combined.data,
      lightGrid(lamps.map(mesh => mesh._worldLights.data), 4096).data);
    assert.equal(cacheLightGrid(lamps, combined, 4096), combined);
    const reordered = cacheLightGrid([otherLamp, lamp], combined, 4096);
    assert.notEqual(reordered, combined);
    assert.equal(combined.meshes[0].mesh, lamp);
    assert.equal(reordered.meshes[0].mesh, otherLamp);

    const headlight = { ...lamp, worldMatrix: [...matrix],
      extras: { lights: [...lamp.extras.lights], dynamicLights: true } };
    const root = { visible: true, children: [lamp, headlight] };
    const buffer = { size: 8192, writes: [] };
    const sun = { lights: buffer };
    const backend = { _layers: [{ options: { nightLight: true }, root }],
      renderer: { sunlight: sun, device: { limits: { maxStorageBufferBindingSize: 8192 },
        queue: { writeBuffer: recordLightUpload } } } };
    globals.sceneByLayer.set(backend, backend);
    globals.sceneByLayer.set(backend._layers[0], backend._layers[0]);
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
    globals.sceneByLayer.get(backend).renderer.device.limits.maxStorageBufferBindingSize = sun.staticLightGrid.data.byteLength;
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
    const otherMesh = { ...emptyNode(), program: {}, geometry: { attributes: { position: { data: [...vertices] } } } };
    const otherWalls = collider(otherMesh);
    otherWalls.tri[0] = 99;
    otherWalls.origin[0] = 99;
    otherWalls.cells.clear();
    assert.equal(walls.tri[0], 0);
    assert.equal(walls.origin[0], 0);
    assert.ok(walls.cells.size > 0, 'Collider caches must be independent across geometries');
    const hits = [{ distance: 2, id: 'far' }, { distance: 1, id: 'first' }, { distance: 1, id: 'second' }];
    assert.equal(sortHits(hits), hits);
    assert.deepEqual(hits.map(hit => hit.id), ['first', 'second', 'far']);
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
    const walls = materialShaders({ wallTexture: true });
    assert.deepEqual(walls.bindings, [{ name: 'roofTexture', texture: 3, sampler: 4 }]);
    assert.match(walls.vertex, /true && abs\(input.normal.y\) < 0.5/);
    assert.match(walls.vertex, /false && input.normal.y >= 0.5/);
    for (const name of ['roofTexture', 'wallTexture']) {
      for (const opacity of [false, true, 0, 0.25, 0.75, 1]) {
        const shader = materialShaders({ [name]: opacity });
        if (opacity) {
          assert.ok(shader.vertex.includes(name === 'wallTexture'
            ? `select(${Number(opacity).toFixed(8)}, 0.00000000`
            : `select(0.00000000, ${Number(opacity).toFixed(8)}`));
          assert.match(shader.fragment, /input.roof > 0.0/);
        } else assert.deepEqual(shader.bindings, []);
      }
      for (const opacity of [-1, 1.1, NaN, Infinity, '0.5', null]) {
        assert.throws(() => materialShaders({ [name]: opacity }),
          new RegExp(`${name} must be a boolean or a finite number between 0 and 1`));
      }
    }
    assert.match(plain.fragment, /appearance\(input.position.xy\)/);
    const mesh = (id, depth, transparent = false) => ({ id, _sortDepth: depth, program: { transparent } });
    const far = mesh(1, 0.9), near = mesh(2, 0.1);
    const glassNear = mesh(3, 0.2, true), glassFar = mesh(4, 0.8, true);
    const ground = { ...mesh(5, 1, true), ground: true, tile: { coords: { z: 17 } } };
    const preview = { ...mesh(6, 1, true), ground: true, tile: { coords: { z: 15 } } };
    assert.deepEqual(sortMeshes([far, glassNear, ground, near, glassFar, preview]).map(mesh => mesh.id),
      [6, 5, 2, 1, 4, 3]);
  },

  'simulation-clock'() {
    const classes = new Set();
    const container = {
      style: { color: 'red' },
      classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
    };
    styleTimeControl(container, false);
    assert.deepEqual(container.style, { color: 'red', background: '#fff', padding: '8px', margin: '' });
    assert.deepEqual([...classes], ['leaflet-control', 'leaflet-bar']);
    styleTimeControl(container, true);
    assert.deepEqual(container.style, { color: 'red', background: '', padding: '2px 0 6px 20px', margin: '0' });
    assert.equal(classes.size, 0);
    styleTimeControl(container, false);
    assert.equal(container.style.padding, '8px');
    const events = [];
    const style = { setProperty() {}, removeProperty() {} };
    const map = {
      getCenter() { return { lat: 48.858, lng: 2.2945 }; },
      getSize() { return { x: 800, y: 600 }; },
      getContainer() { return { style }; },
      fire(name, event) { events.push(event); },
      off() {},
    };
    globals.cameraByMap.set(map, map);
    const state = {
      map, control: { live: false, time: new Date('2026-06-21T12:00:00Z') },
      date: { value: '', validity: { valid: true } }, slider: { value: '' },
      output: {}, status: {}, projection: { left: 0, top: 0 },
      sunDisc: { style: {}, remove() {} }, moonDisc: { style: {}, remove() {} },
    };
    updateSun(state);
    const firstDate = state.control.time, firstSun = map._sunlight;
    const savedSun = structuredClone(firstSun);
    assert.equal(events[0].time.toISOString(), firstDate.toISOString());
    assert.notEqual(events[0].time, firstDate);
    events[0].time.setUTCFullYear(2000);
    assert.equal(firstDate.getUTCFullYear(), 2026);
    state.date.value = '2026-12-21';
    state.slider.value = '600';
    useSelectedTime(state);
    assert.equal(state.control.time.toISOString(), '2026-12-21T10:00:00.000Z');
    assert.notEqual(state.control.time, firstDate);
    assert.equal(firstDate.toISOString(), '2026-06-21T12:00:00.000Z');
    assert.deepEqual(firstSun, savedSun);
    assert.notEqual(events[0], events[1]);
    assert.notEqual(events[0].time, events[1].time);
    const selectedTime = state.control.time;
    state.date.value = '';
    useSelectedTime(state);
    assert.ok(Number.isNaN(state.control.time.getTime()));
    assert.equal(selectedTime.toISOString(), '2026-12-21T10:00:00.000Z');
    assert.equal(map._sunlight, undefined);
    assert.deepEqual(events.at(-1), { time: null, live: false });
    const before = Date.now();
    useLiveTime(state);
    assert.equal(state.control.live, true);
    assert.ok(state.control.time.getTime() >= before && state.control.time.getTime() <= Date.now());
    const liveTime = state.control.time;
    useLiveTime(state);
    assert.notEqual(state.control.time, liveTime);
    assert.notEqual(events.at(-1).time, state.control.time);
    removeSun(state);
    assert.deepEqual(events.at(-1), { time: null, live: false });
    assert.notEqual(events.at(-1), events.at(-4));
    assert.equal(map._sunlight, undefined);
  },

  sky() {
    const size = { x: 800, y: 600 };
    assert.deepEqual(projectCelestialBody([0, 0, -1], size, Math.PI / 2, 0), { left: 400, top: 300 - 900 * Math.cos(Math.PI / 2) });
    assert.equal(projectCelestialBody([0, 0, 1], size, Math.PI / 2, 0), null);
    const target = { left: -1, top: -1 };
    const first = projectCelestialBody([0, 0, -1], size, Math.PI / 2, 0);
    const saved = { ...first };
    assert.equal(projectCelestialBody([1, 0, -1], size, Math.PI / 2, 0, target), target);
    assert.equal(target.left, 1300);
    assert.deepEqual(first, saved, 'Buffered projections must not mutate independent results');
    const beforeHidden = { ...target };
    assert.equal(projectCelestialBody([0, 0, 1], size, Math.PI / 2, 0, target), null);
    assert.deepEqual(target, beforeHidden, 'Hidden bodies must not overwrite the projection buffer');
    assert.notEqual(projectCelestialBody([0, 0, -1], size, Math.PI / 2, 0), first);
    const color = [99, 99, 99, 99];
    assert.equal(mix([0, 10, 20], [10, 20, 30], 0.5, color), color);
    assert.deepEqual(color, [5, 15, 25]);
    assert.deepEqual(mix([], [], 0.5, color), []);
    const mixed = mix([0], [10], 0.5);
    mix([10], [20], 0.5);
    assert.deepEqual(mixed, [5]);
    assert.equal(rgb([1.2, 2.7, -1.5]), 'rgb(1, 3, -1)');
    assert.equal(rgb([]), 'rgb()');
    const night = atmosphere(-18);
    const nightCopy = structuredClone(night);
    const day = atmosphere(25);
    assert.equal(day.background, 'linear-gradient(rgb(53, 144, 213), rgb(223, 238, 250))');
    assert.equal(night.background, 'linear-gradient(rgb(3, 7, 20), rgb(17, 28, 54))');
    day.tint[0] = 99;
    assert.deepEqual(night, nightCopy);
    assert.deepEqual(atmosphere(25).tint, [1, 1, 1], 'Atmosphere results must not alias each other or the constant stops');
    const style = {
      value: '',
      setProperty(name, value) { this.value = value; },
      removeProperty() { this.value = ''; },
    };
    const sky = { clientHeight: 600, style: { display: '' }, append(disc) { disc.parentNode = this; } };
    const map = {
      _cameraPitch: 90, _cameraBearing: 0, _pitchSky: sky,
      _sunlight: { altitude: 20, direction: [0, 0, -1], background: 'day',
        moon: { altitude: 10, direction: [0.1, 0, -1] } },
      getSize() { return size; },
      getContainer() { return { style }; },
    };
    globals.cameraByMap.set(map, map);
    const control = {
      map, originalSky: 'original', projection: target,
      sunDisc: { style: {} }, moonDisc: { style: {} },
    };
    updateSky(control);
    assert.equal(control.sunDisc.hidden, false);
    assert.equal(control.moonDisc.hidden, false);
    assert.equal(control.sunDisc.style.left, '400px');
    assert.equal(control.moonDisc.style.left, '490px');
    assert.equal(style.value, 'day');
    assert.equal(control.projection, target);
    map._sunlight.moon.direction = [0, 0, 1];
    updateSky(control);
    assert.equal(control.moonDisc.hidden, true);
    assert.equal(control.sunDisc.hidden, false);
    delete globals.cameraByMap.get(map)._sunlight;
    updateSky(control);
    assert.equal(control.sunDisc.hidden, true);
    assert.equal(control.moonDisc.hidden, true);
    assert.equal(style.value, 'original');
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
      import(`${base}/src/scene/createSceneNode.js`),
      import(`${base}/src/scene/setParent.js`),
      import(`${base}/src/transforms/updateWorldMatrix.js`),
      import(`${base}/src/camera/updateSceneCamera.js`),
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
    const transformed = [];
    for (const matrix of [
      new DOMMatrix().translate(3, -2, -7).rotate(12, 31, 7).scale(2, 3, 4),
      new DOMMatrix().translate(-4, 5, -12).rotate(0, 40, 0).scale(-2, 1, 0.5),
      new DOMMatrix([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 3, -2, -7, 2]),
    ]) {
      const object = mesh(0);
      object.worldMatrix = matrix.toFloat64Array();
      const origin = new DOMPoint(0, 0, 5, 1).matrixTransform(matrix);
      const direction = new DOMPoint(0, 0, -1, 0).matrixTransform(matrix);
      const expected = new DOMPoint(0, 0, 0, 1).matrixTransform(matrix);
      const found = intersectMeshes({
        origin: [origin.x / origin.w, origin.y / origin.w, origin.z / origin.w],
        direction: [direction.x, direction.y, direction.z],
      }, [object])[0];
      transformed.push(found && found.point.every((value, i) =>
        Math.abs(value - [expected.x / expected.w, expected.y / expected.w, expected.z / expected.w][i]) < 1e-10));
    }
    const NativePoint = globalThis.DOMPoint, NativeMatrix = globalThis.DOMMatrix;
    let matrixCount = 0, noPointHits;
    try {
      globalThis.DOMPoint = class { constructor() { throw new Error('Raycasting must not allocate DOMPoint'); } };
      globalThis.DOMMatrix = new Proxy(NativeMatrix, {
        construct(target, args) {
          matrixCount++;
          return new target(...args);
        },
      });
      noPointHits = intersectMeshes(ray, [far, near], 1).length;
    } finally {
      globalThis.DOMPoint = NativePoint;
      globalThis.DOMMatrix = NativeMatrix;
    }
    const singular = mesh(0);
    singular.worldMatrix = new DOMMatrix().scale(0, 1, 1).toFloat64Array();
    let singularError;
    try { intersectMeshes(ray, [singular]); } catch (error) { singularError = error.message; }
    return {
      position, cached, updated, projection: [project(-1), project(-100)],
      hits: hits.map(hit => ({ distance: hit.distance, point: hit.point, faceIndex: hit.faceIndex })),
      dayHits, nightHits, backfaceHits, transformed, matrixCount, noPointHits, singularError,
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
  assert.deepEqual(result.transformed, [true, true, true]);
  assert.equal(result.matrixCount, 2);
  assert.equal(result.noPointHits, 2);
  assert.equal(result.singularError, 'Singular 3D transform');
});
