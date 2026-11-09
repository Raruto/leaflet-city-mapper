import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Then } from '@cucumber/cucumber';
import { mockLeaflet } from '../fixtures/leaflet.js';
import { buildAreaFeature } from '../../src/sources/buildAreaFeature.js';
import { assembleAreaGeometry } from '../../src/geometry/assembleAreaGeometry.js';
import { instanceAreaGeometry } from '../../src/geometry/instanceAreaGeometry.js';
import { rootByLayer } from '../../src/weakmaps/rootByLayer.js';
import { buildAreaInWorker } from '../../src/workers/buildAreaInWorker.js';
import { geometryWorkersByMap } from '../../src/weakmaps/geometryWorkersByMap.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';

Then('prepared geometry matches CPU vertices, lights, ranges and instancing', function () {
  const previous = mockLeaflet({ LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } } });
  const square = (x, y) => [[x, y], [x + 4, y], [x + 4, y + 4], [x, y + 4], [x, y]];
  const polygon = coordinates => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates }, properties: {} });
  const point = (x, style, properties = {}) => ({ type: 'Feature', id: x,
    geometry: { type: 'Point', coordinates: [x, 0] }, properties: { style, ...properties } });
  const tree = { top: 8, trunkRadius: 0.25, crownRadius: 2, crownBottom: 3, unused: () => {} };
  const datasets = [
    { features: [polygon([square(0, 0), square(1, 1).map(([x, y]) => [x / 2, y / 2])]),
      { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[square(10, 0)], [square(20, 0)]] },
        properties: { style: { top: 12, bottom: 3, color: { h: 0.2, s: 0.4, l: 0.6 } } } },
      point(30, tree), point(40, { ...tree, crownShape: 'cone', color: 0x446633 }),
      { ...polygon([square(50, 0)]), properties: { skip: true } }] },
    { features: Array.from({ length: 100 }, (_, i) => point(i * 16, tree)) },
    { nightLight: true, features: [
      point(0, { top: 8, color: 0xffcc88, poleRadius: 0.1, lightRadius: 2, lightFlux: 800 }, { cod_ouvrag: 'shared' }),
      point(0, { top: 8, color: 0xffcc88, poleRadius: 0.1, lightRadius: 2, lightFlux: 800 }, { cod_ouvrag: 'shared' }),
      point(10, { top: 6, color: 0xffffff, poleRadius: 0, lightRadius: 1, lightFlux: 100 }),
    ] },
  ];
  try {
    for (const { features, nightLight } of datasets) {
      const layer = { options: { nightLight, style: feature => feature.properties.skip ? null
        : feature.properties.style || { top: 10, color: 0x998877 } } };
      rootByLayer.set(layer, { position: [0, 2, 0] });
      const makeContext = () => ({ backend: layer, area: {}, map: {},
        crs: { project: location => ({ x: location.lng, y: location.lat }) },
        origin: { x: 0, y: 0 }, metres: 1, positions: [], normals: [], colors: [], uvs: [],
        featureFaces: [], lights: [], supports: new Set(), skipped: 0 });
      const cpu = makeContext(), queued = makeContext();
      queued.jobs = [];
      for (const feature of features) { buildAreaFeature(cpu, feature); buildAreaFeature(queued, feature); }
      const expected = instanceAreaGeometry(cpu);
      const actual = assembleAreaGeometry({ jobs: structuredClone(queued.jobs), nightLight });
      for (const name of ['positions', 'normals', 'colors']) {
        assert.deepEqual(actual[name], Float32Array.from(expected[name]), name);
      }
      assert.deepEqual(actual.instanceOffsets, expected.instanceOffsets);
      assert.deepEqual(actual.uvs, Float32Array.from(cpu.uvs));
      assert.deepEqual(actual.lights, cpu.lights);
      const expectedGeometry = { attributes: {
        position: { data: Float32Array.from(expected.positions) },
        instanceOffset: expected.instanceOffsets ? { data: expected.instanceOffsets, size: 4 } : undefined,
      } };
      computeBounds(expectedGeometry);
      assert.deepEqual(actual.bounds, expectedGeometry.bounds);
      assert.equal(queued.skipped, cpu.skipped);
      assert.deepEqual(actual.ranges, cpu.featureFaces.map(({ vertexStart, vertexEnd, faceStart, faceEnd }) =>
        ({ vertexStart, vertexEnd, faceStart, faceEnd })));
      for (let i = 0; i < queued.featureFaces.length; i++) {
        assert.equal(queued.featureFaces[i].id, cpu.featureFaces[i].id);
        assert.equal(queued.featureFaces[i].properties, cpu.featureFaces[i].properties);
      }
      if (features.length === 100) assert.ok(actual.instanceOffsets);
      const invalid = structuredClone(queued.jobs);
      const treeJob = invalid.find(job => job.point && !nightLight);
      if (treeJob) {
        treeJob.style.trunkRadius = -1;
        assert.throws(() => assembleAreaGeometry({ jobs: invalid, nightLight }), /Invalid tree/);
      }
    }
  } finally {
    mockLeaflet(previous);
  }
});

Then('geometry worker tasks transfer results and terminate on every exit', async function () {
  const original = globalThis.Worker;
  const workers = [];
  let mode = 'success';
  globalThis.Worker = class extends EventTarget {
    constructor(url, options) { super(); this.url = url; this.options = options; workers.push(this); }
    postMessage(input) {
      if (mode === 'clone') throw new DOMException('Cannot clone', 'DataCloneError');
      if (mode === 'pending') return;
      const data = mode === 'invalid' ? { error: { name: 'TypeError', message: 'Invalid geometry' } }
        : assembleAreaGeometry(input);
      this.data = data;
      queueMicrotask(() => {
        if (mode === 'load') this.dispatchEvent(Object.assign(new Event('error'), { message: 'Missing worker' }));
        else if (mode === 'decode') this.dispatchEvent(new Event('messageerror'));
        else this.dispatchEvent(new MessageEvent('message', { data }));
      });
    }
    terminate() { this.terminated = (this.terminated || 0) + 1; }
  };
  const makeContext = () => ({ backend: { options: { workerUrl: 'https://example.invalid/geometry.js' } },
    jobs: [{ polygons: [[[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]]],
      style: { top: 2, bottom: 0 }, baseColor: { r: 1, g: 1, b: 1 } }],
    featureFaces: [{ id: 'retained', properties: { height: 2 } }] });
  try {
    const context = makeContext(), face = context.featureFaces[0], properties = face.properties;
    await buildAreaInWorker(context, new AbortController().signal);
    assert.equal(context.featureFaces[0], face);
    assert.equal(face.properties, properties);
    assert.equal(face.vertexStart, 0);
    assert.equal(face.vertexEnd, context.positions.length / 3);
    assert.equal(context.positions, workers[0].data.positions);
    assert.equal(context.preparedGeometry, workers[0].data);
    assert.equal(context.jobs, null);
    assert.equal(workers[0].url, context.backend.options.workerUrl);
    assert.deepEqual(workers[0].options, { type: 'module' });
    for (const [nextMode, message] of [['invalid', /Invalid geometry/], ['load', /Missing worker/],
      ['decode', /receive geometry worker/], ['clone', /Cannot clone/]]) {
      mode = nextMode;
      await assert.rejects(buildAreaInWorker(makeContext(), new AbortController().signal), message);
    }
    mode = 'pending';
    const controller = new AbortController();
    const pending = buildAreaInWorker(makeContext(), controller.signal);
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    await assert.rejects(buildAreaInWorker(makeContext(), controller.signal), { name: 'AbortError' });
    for (const worker of workers) assert.equal(worker.terminated, 1);
    mode = 'success';
    let close;
    const map = { once(type, handler) { assert.equal(type, 'unload'); close = handler; } };
    const makePooled = () => ({ ...makeContext(), map });
    const before = workers.length;
    await buildAreaInWorker(makePooled(), new AbortController().signal);
    await buildAreaInWorker(makePooled(), new AbortController().signal);
    assert.equal(workers.length, before + 1, 'Completed work must reuse its worker');
    assert.equal(workers.at(-1).terminated, undefined);
    await Promise.all(Array.from({ length: 4 }, () => buildAreaInWorker(makePooled(), new AbortController().signal)));
    const pool = geometryWorkersByMap.get(map);
    assert.equal(pool.entries.size, 4);
    assert.equal(pool.idle.length, 4);
    const custom = makePooled();
    custom.backend.options.workerUrl = 'https://example.invalid/other.js';
    await buildAreaInWorker(custom, new AbortController().signal);
    assert.equal(pool.entries.size, 4, 'Different URLs must replace an idle worker, not accumulate it');
    assert.equal(workers.at(-1).url, custom.backend.options.workerUrl);
    mode = 'pending';
    const active = buildAreaInWorker(makePooled(), new AbortController().signal);
    close();
    await assert.rejects(active, { name: 'AbortError' });
    assert.equal(pool.entries.size, 0);
    assert.equal(pool.idle.length, 0);
    await assert.rejects(buildAreaInWorker(makePooled(), new AbortController().signal), { name: 'AbortError' });
    for (const worker of workers) assert.equal(worker.terminated, 1);
  } finally {
    if (original === undefined) delete globalThis.Worker;
    else globalThis.Worker = original;
  }
});

Then('native and bundled geometry workers preserve results without blocking animation frames', { timeout: 60000 }, async function () {
  const context = await this.context.browser().newContext();
  try {
    const page = await context.newPage();
    await page.goto(this.baseUrl);
    const result = await page.evaluate(async () => {
      const { assembleAreaGeometry } = await import('/src/geometry/assembleAreaGeometry.js');
      const { buildAreaInWorker } = await import('/src/workers/buildAreaInWorker.js');
      const jobs = Array.from({ length: 2000 }, (_, i) => ({
        point: { x: i * 16, y: 0, ground: i % 3 }, polygons: [],
        style: { top: 8, bottom: 0, trunkRadius: 0.25, crownRadius: 2, crownBottom: 3,
          color: { r: 0.3, g: 0.5, b: 0.2 }, trunkColor: { r: 0.4, g: 0.3, b: 0.2 } },
        baseColor: { r: 0.3, g: 0.5, b: 0.2 },
      }));
      const start = performance.now();
      const reference = assembleAreaGeometry({ jobs, nightLight: false });
      const cpuMs = performance.now() - start;
      const runs = [];
      let close;
      const map = { once(type, handler) { close = handler; } };
      for (const workerUrl of [undefined, '/dist/leaflet-city-mapper-worker.js']) {
        const state = { backend: { options: { workerUrl } }, map, jobs, featureFaces: jobs.map(() => ({})) };
        let frames = 0, counting = true;
        const tick = () => { if (counting) { frames++; requestAnimationFrame(tick); } };
        requestAnimationFrame(tick);
        const begin = performance.now();
        await buildAreaInWorker(state, new AbortController().signal);
        counting = false;
        for (const name of ['positions', 'normals', 'colors', 'uvs']) {
          const expected = reference[name], actual = state.preparedGeometry[name];
          if (!(actual instanceof Float32Array) || actual.length !== expected.length) throw new Error(`Invalid ${name} buffer`);
          for (let i = 0; i < actual.length; i++) if (actual[i] !== expected[i]) throw new Error(`Different ${name} at ${i}`);
        }
        if (JSON.stringify(state.featureFaces) !== JSON.stringify(reference.ranges)) throw new Error('Different feature ranges');
        runs.push({ ms: performance.now() - begin, frames, bytes: state.positions.byteLength });
      }
      close();
      const cancel = new AbortController();
      const pending = buildAreaInWorker({ backend: { options: {} }, jobs, featureFaces: jobs.map(() => ({})) }, cancel.signal);
      cancel.abort();
      let aborted = false;
      try { await pending; } catch (error) { aborted = error.name === 'AbortError'; }
      const bad = { ...jobs[0], style: { ...jobs[0].style, trunkRadius: -1 } };
      let error = '';
      try {
        await buildAreaInWorker({ backend: { options: {} }, jobs: [bad], featureFaces: [{}] }, new AbortController().signal);
      } catch (failure) { error = failure.message; }
      return { cpuMs, runs, aborted, error };
    });
    assert.equal(result.aborted, true);
    assert.match(result.error, /Invalid tree/);
    for (const run of result.runs) {
      assert.ok(run.frames >= 2, 'Animation frames must continue during geometry construction');
      assert.ok(run.bytes > 0);
    }
    console.log('Geometry worker benchmark:', JSON.stringify(result));
  } finally {
    await context.close();
  }
});

Then('cross-origin geometry workers preserve results, report failures and release blob URLs', { timeout: 60000 }, async function () {
  const bundle = await readFile('dist/leaflet-city-mapper-worker.js');
  const plugin = await build({
    stdin: {
      contents: "import { buildAreaInWorker } from './src/workers/buildAreaInWorker.js'; globalThis.workerTest = buildAreaInWorker;",
      resolveDir: process.cwd(),
    },
    bundle: true, format: 'iife', define: { 'import.meta': 'null' }, write: false,
  });
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'text/javascript');
    if (request.url === '/plugin.js') response.end(plugin.outputFiles[0].text);
    else if (request.url === '/leaflet-city-mapper-worker.js') response.end("import './actual.js';");
    else if (request.url === '/actual.js') response.end(bundle);
    else response.writeHead(404).end('Not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await this.page.goto(this.baseUrl);
    const workerOrigin = `http://127.0.0.1:${server.address().port}`;
    await this.page.addScriptTag({ url: `${workerOrigin}/plugin.js` });
    const result = await this.page.evaluate(async workerOrigin => {
      const buildAreaInWorker = globalThis.workerTest;
      const created = [], revoked = [];
      const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
      URL.createObjectURL = blob => { const url = create.call(URL, blob); created.push(url); return url; };
      URL.revokeObjectURL = url => { revoked.push(url); revoke.call(URL, url); };
      try {
        let close;
        const map = { once(type, handler) { close = handler; } };
        const run = url => buildAreaInWorker({
          backend: { options: { workerUrl: url } }, map, jobs: [], featureFaces: [],
        }, new AbortController().signal);
        await run(undefined);
        await run(undefined);
        let error = '';
        try { await run(`${workerOrigin}/missing.js`); } catch (failure) { error = failure.message; }
        const controller = new AbortController();
        const pending = buildAreaInWorker({
          backend: { options: {} }, map, jobs: [], featureFaces: [],
        }, controller.signal);
        controller.abort();
        let aborted = false;
        try { await pending; } catch (failure) { aborted = failure.name === 'AbortError'; }
        const Worker = globalThis.Worker;
        let constructorError = '';
        try {
          globalThis.Worker = class { constructor() { throw new Error('Worker blocked'); } };
          await run(undefined);
        } catch (failure) {
          constructorError = failure.message;
        } finally {
          globalThis.Worker = Worker;
        }
        close();
        return { created, revoked, error, aborted, constructorError };
      } finally {
        URL.createObjectURL = create;
        URL.revokeObjectURL = revoke;
      }
    }, workerOrigin);
    assert.equal(result.created.length, 4, 'The same cross-origin worker must be reused');
    assert.deepEqual(result.revoked, result.created);
    assert.match(result.error, /Geometry worker failed/);
    assert.equal(result.aborted, true);
    assert.equal(result.constructorError, 'Worker blocked');
    assert.ok(requests.includes('/leaflet-city-mapper-worker.js'));
    assert.ok(requests.includes('/actual.js'), 'Relative imports must resolve against the worker URL');
    assert.ok(requests.includes('/missing.js'));
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

Then('large GeoJSON blocks match CPU meshes and preserve replacement and cancellation', { timeout: 60000 }, async function () {
  let workers = 0;
  const onWorker = () => workers++;
  this.page.on('worker', onWorker);
  try {
    const result = await this.page.evaluate(async () => {
      const container = document.body.appendChild(document.createElement('div'));
      container.style.cssText = 'height:500px;width:600px';
      const map = new L.Map(container, { center: [41.89, 12.49], zoom: 18, pitch: 45 });
      const data = { type: 'FeatureCollection', features: Array.from({ length: 80 }, (_, i) => ({
        type: 'Feature', id: i, properties: { height: 8 },
        geometry: { type: 'Point', coordinates: [12.49 + i * 0.00001, 41.89] },
      })) };
      const errors = [];
      const makeLayer = worker => new L.Layer({ source: { type: 'geojson', worker,
        data, center: [41.89, 12.49],
        style: () => ({ top: 8, trunkRadius: 0.25, crownRadius: 2, crownBottom: 3,
          color: 'rebeccapurple', trunkColor: '#72513a', unused: () => {} }),
        tooltip: feature => feature.id } }).on('error', ({ error }) => errors.push(error.message));
      const completed = layer => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('GeoJSON build timed out')), 10000);
        const progress = event => {
          if (event.pending) return;
          clearTimeout(timer);
          layer.off('progress', progress);
          if (event.errors.length) reject(new Error(event.errors[0]));
          else resolve(event.loaded);
        };
        layer.on('progress', progress);
      });
      const cpu = makeLayer(false), threaded = makeLayer(true);
      let done = completed(cpu); cpu.addTo(map); await done;
      done = completed(threaded); threaded.addTo(map); await done;
      const cpuArea = globals.sceneByLayer.get(cpu)._areas.get('geojson');
      const area = globals.sceneByLayer.get(threaded)._areas.get('geojson');
      const same = Object.keys(cpuArea.mesh.geometry.attributes).every(name => {
        const a = cpuArea.mesh.geometry.attributes[name].data, b = area.mesh.geometry.attributes[name].data;
        return a.length === b.length && a.every((value, i) => value === b[i]);
      });
      const identity = area.mesh.extras.featureFaces.every((face, i) => face.properties === data.features[i].properties && face.id === i);
      const next = { type: 'FeatureCollection', features: data.features.slice(0, 1) };
      done = completed(threaded); testOperations.setData(threaded, next); const replaced = await done;
      const cancelled = area.request.signal.aborted;
      done = completed(threaded); testOperations.setData(threaded, data); await done;
      threaded.remove();
      done = completed(threaded); threaded.addTo(map); const restored = await done;
      testOperations.setData(threaded, data);
      const obsolete = globals.sceneByLayer.get(threaded)._areas.get('geojson');
      threaded.remove();
      await new Promise(resolve => setTimeout(resolve, 100));
      const obsoleteAborted = obsolete.request.signal.aborted;
      cpu.remove(); map.remove(); container.remove();
      return { same, identity, replaced, cancelled, restored, obsoleteAborted, errors };
    });
    assert.deepEqual(result, { same: true, identity: true, replaced: 1, cancelled: true,
      restored: 80, obsoleteAborted: true, errors: [] });
    assert.ok(workers >= 1 && workers <= 4, 'Large GeoJSON sources must create and reuse bounded workers');
  } finally {
    this.page.off('worker', onWorker);
  }
});
