import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Given, Then } from '@cucumber/cucumber';
import { along } from '../../src/traffic/along.js';
import { scheduledTrips } from '../../src/traffic/scheduledTrips.js';
import { routeGeometry } from '../../src/traffic/routeGeometry.js';
import { refreshTrafficTrips } from '../../src/traffic/refreshTrafficTrips.js';
import { toLanes } from '../../src/traffic/toLanes.js';

import { vehicleOffsets } from '../../src/traffic/vehicleOffsets.js';
import { getLocation } from '../../src/scene/getLocation.js';
import { cyclingCounts, mobilityLanes, trafficHour, parisMobility, parisTransit } from '../../examples/data/paris-traffic.js';
import parisTraffic from '../../examples/data/paris-traffic.js';
import { trafficResponse, fulfillTrafficRoute } from '../fixtures/traffic-data.js';

const [cruise] = JSON.parse(readFileSync(new URL('../../examples/data/seine-cruises.geojson', import.meta.url))).features;
const cruises = date => scheduledTrips(date, cruise.properties.timetable);
const route = cruise.geometry.coordinates;

Then('unchanged traffic refreshes preserve their clock and status without rebuilding', function () {
  const state = {
    lanes: [], trips: [], tripsKey: '', loaded: true, vehicle: 'car', velocity: 8,
    status: { textContent: '', removeAttribute() {} },
  };
  const time = new Date('2026-11-04T12:00:00Z'), ms = time.getTime();
  assert.equal(refreshTrafficTrips(state, time, ms, true), false);
  assert.equal(state.status.textContent, '0 car');
  assert.equal(state.rebasedAt, ms);
  assert.equal(state.nextCheck, ms + 1000);
  assert.equal(refreshTrafficTrips(state, time, ms + 1000, true), false);
  assert.equal(state.nextCheck, ms + 2000);
  assert.equal(refreshTrafficTrips(state, null, NaN, false), false);
  assert.equal(state.status.textContent, 'car: select a valid simulation date');
  assert.deepEqual(state.trips, []);
});

Then('traffic counts wrap together and clean up across layer toggles', async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const url = `data:application/json,${encodeURIComponent(JSON.stringify({ type: 'FeatureCollection', features: [] }))}`;
    const modes = ['car', 'bus', 'boat', 'bicycle', 'pedestrian', 'tram', 'metro'];
    const traffic = modes.map(vehicle => new L.Layer({ source: { type: 'traffic', url, vehicle } }));
    const group = new L.LayerGroup(traffic);
    const control = new L.Control.Layers({}, { Traffic: group }, { collapsed: false }).addTo(map);
    group.addTo(map);
    await Promise.all(traffic.map(layer => nativeChecks.ready(layer)));
    const deadline = performance.now() + 5000;
    while (traffic.some(layer => !globals.trafficByLayer.get(layer)?.loaded)) {
      if (performance.now() > deadline) throw new Error('Traffic did not load');
      await new Promise(requestAnimationFrame);
    }
    const container = control.getContainer();
    const box = container.querySelector('.traffic-status-group');
    const statuses = [...box.children];
    const rects = statuses.map(element => element.getBoundingClientRect());
    const compact = new Set(rects.map(rect => rect.top)).size < modes.length;
    const contained = rects.every(rect => rect.right <= box.getBoundingClientRect().right + 1);
    const named = modes.every(mode => statuses.some(element => element.title === mode));
    const extra = new L.LayerGroup();
    control.addOverlay(extra, 'Extra');
    extra.addTo(map);
    await new Promise(queueMicrotask);
    const rebuilt = container.querySelectorAll('.traffic-status-group').length === 1 &&
      container.querySelectorAll('.traffic-status').length === modes.length;
    group.remove();
    await new Promise(queueMicrotask);
    const removed = !container.querySelector('.traffic-status-group');
    group.addTo(map);
    await new Promise(queueMicrotask);
    const restored = container.querySelectorAll('.traffic-status-group').length === 1 &&
      container.querySelectorAll('.traffic-status').length === modes.length;
    group.removeLayer(traffic[0]);
    await new Promise(queueMicrotask);
    const partial = container.querySelectorAll('.traffic-status').length === modes.length - 1;
    group.remove();
    extra.remove();
    control.remove();
    return { compact, contained, named, rebuilt, removed, restored, partial };
  });
  assert.deepEqual(result, { compact: true, contained: true, named: true, rebuilt: true,
    removed: true, restored: true, partial: true });
});

Then('traffic scratch preserves route vertices and independent lane and pose results', function () {
  const points = [[0, 0, 10], [60, 0, 16]], lengths = [0, 60];
  const first = along(points, lengths, 15), second = along(points, lengths, 45), target = {};
  assert.notEqual(first, second);
  assert.equal(along(points, lengths, 30, target), target);
  assert.deepEqual(first, { x: 15, y: 11.5, z: 0, dx: 1, dz: 0 });
  assert.deepEqual(target, { x: 30, y: 13, z: 0, dx: 1, dz: 0 });
  const lanes = [{ points, lengths, properties: { route_color: 'FF8000' } }];
  const geometry = routeGeometry(lanes), next = routeGeometry(lanes);
  assert.deepEqual(geometry.position.slice(0, 18), [
    0, 10.4, -2.5, 0, 10.4, 2.5, 18, 12.200000000000001, 2.5,
    0, 10.4, -2.5, 18, 12.200000000000001, 2.5, 18, 12.200000000000001, -2.5,
  ]);
  assert.equal(geometry.position.length, 36);
  assert.deepEqual(geometry.normal.slice(0, 3), [0, 1, 0]);
  assert.deepEqual(geometry.color.slice(0, 3), [1, 128 / 255, 0]);
  for (const name of ['position', 'normal', 'color']) {
    assert.notEqual(geometry[name], next[name]);
    geometry[name][0] = 999;
    assert.notEqual(next[name][0], 999);
  }
  const source = { features: [
    { geometry: { type: 'LineString', coordinates: [[2, 48], [3, 49]] } },
    { geometry: { type: 'MultiLineString', coordinates: [[[4, 50], [5, 51]], [[6, 52], [7, 53]]] } },
    { geometry: { type: 'Point', coordinates: [0, 0] } },
  ] };
  const converted = toLanes(source);
  assert.deepEqual(converted.map(lane => lane.latlngs), [
    [[48, 2], [49, 3]], [[50, 4], [51, 5]], [[52, 6], [53, 7]],
  ]);
  converted[0].latlngs[0][0] = 0;
  converted[0].properties.name = 'first';
  assert.equal(source.features[0].geometry.coordinates[0][1], 48);
  assert.equal(converted[1].properties.name, undefined);
  assert.deepEqual(toLanes({}), []);
});

Then('HTTP traffic loaders refresh per map and distinguish measured from assumed flows', async function () {
  const original = globalThis.fetch, requests = [];
  globalThis.fetch = mockTrafficFetch.bind(null, requests);
  const signal = new AbortController().signal;
  const time = new Date('2026-11-04T12:00:00Z');
  try {
    for (const mode of ['car', 'bicycle', 'pedestrian', 'bus', 'tram', 'metro']) {
      const layer = { options: { center: [48.858, 2.295], mobilityMode: mode, transitMode: mode } };
      globals.sceneByLayer.set(layer, layer);
      const load = mode === 'car' ? parisTraffic : ['bicycle', 'pedestrian'].includes(mode) ? parisMobility : parisTransit;
      const first = await load(time, layer, signal);
      assert.ok(first.features.length, mode);
      assert.match(first.note, ['car', 'bicycle'].includes(mode) ? /measured/ : /no (live|measured) counts/);
      const count = requests.length;
      assert.equal(await load(time, layer, signal), first, 'Reuse within the same simulation hour');
      assert.equal(requests.length, count);
      const another = { ...layer };
      globals.sceneByLayer.set(another, another);
      await load(time, another, signal);
      assert.ok(requests.length > count, 'A new map/layer must request fresh HTTP data');
    }
    assert.ok(requests.every(isFreshTrafficRequest));
    const before = requests.length;
    const later = { options: { center: [48.858, 2.295] } };
    globals.sceneByLayer.set(later, later);
    await parisTraffic(new Date('2026-11-04T13:00:00Z'), later, signal);
    assert.ok(requests.length > before);
    globalThis.fetch = unavailableTrafficFetch;
    await assert.rejects(parisTransit(time, { options: { transitMode: 'bus' } }, signal), /HTTP 503/);
    await assert.rejects(parisMobility(time, { options: { mobilityMode: 'pedestrian' } }, signal), /HTTP 503/);
    const aborted = AbortSignal.abort();
    await assert.rejects(parisTransit(time, { options: { transitMode: 'bus' } }, aborted), /abort/i);
  } finally {
    globalThis.fetch = original;
  }
});

function isFreshTrafficRequest(request) {
  return request.options.cache === 'no-store' && !request.url.includes('.pmtiles');
}

async function mockTrafficFetch(requests, url, options) {
  options.signal?.throwIfAborted();
  requests.push({ url: String(url), options });
  return new Response(JSON.stringify(trafficResponse(url)), { status: 200 });
}

async function unavailableTrafficFetch() {
  return new Response('', { status: 503 });
}

Then('cycling counts are only assigned to nearby paths and preserve zero or missing coverage', function () {
  const paths = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {},
    geometry: { type: 'LineString', coordinates: [[2.294, 48.858], [2.305, 48.858]] } }] };
  const counter = { id_compteur: 'a', sum_counts: 180, coordinates: { lon: 2.295, lat: 48.858 } };
  const data = cyclingCounts(paths, [counter, { ...counter, id_compteur: 'b', sum_counts: 0 },
    { ...counter, id_compteur: 'far', coordinates: { lon: 2.4, lat: 48.9 } }], '2026-11-03T22:00:00Z');
  assert.equal(data.features.length, 1);
  assert.equal(data.features[0].properties.flow, 180);
  assert.deepEqual(data.features[0].properties.counters, ['a', 'b']);
  assert.match(data.note, /1 unmatched/);
  assert.equal(cyclingCounts(paths, [], 'test').features.length, 0);
  assert.equal(cyclingCounts(paths, [{ ...counter, sum_counts: 0 }], 'test').features[0].properties.flow, 0);
  assert.throws(() => cyclingCounts(paths, [{ ...counter, sum_counts: NaN }], 'test'), /Invalid cycling counter/);
  assert.equal(paths.features[0].properties.flow, undefined);
});

Then('all traffic models match CPU poses on GPU workgroup boundaries', { timeout: 60000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const layer = new L.Layer({ source: { type: '3d' } }).addTo(test3d.map);
    await globals.sceneByLayer.get(layer).ready;
    await globals.sceneByLayer.get(layer)._added.promise;
    try {
      const { checkTrafficCompute } = await import('/test/fixtures/traffic-compute.js');
      return await checkTrafficCompute(globals.sceneByLayer.get(layer).renderer.device);
    } finally {
      layer.remove();
    }
  });
  assert.equal(result.length, Object.keys(globals.vehicles).length);
});
Then('mobility paths are clipped, deduplicated and validated without inventing pedestrian roads', function () {
  const path = { type: 'Feature', properties: { osm_id: 1, date_export: '2026-01-01', amenagement: 'voie verte' },
    geometry: { type: 'LineString', coordinates: [[-1, 0.5], [2, 0.5], [2, 2], [0.5, 2], [0.5, -1]] } };
  const old = structuredClone(path);
  old.properties.date_export = '2021-01-01';
  old.geometry.coordinates = [[0, 0], [1, 1]];
  const road = structuredClone(path);
  road.properties = { ...path.properties, osm_id: 2, amenagement: 'piste cyclable' };
  road.geometry.coordinates = [[0, 0], [1, 1]];
  const duplicate = structuredClone(path);
  duplicate.geometry.coordinates.reverse();
  const data = { type: 'FeatureCollection', features: [old, path, road, duplicate] }, before = JSON.stringify(data);
  const clipped = mobilityLanes(data, 'pedestrian', [0, 0, 1, 1]);
  assert.equal(clipped.features.length, 2);
  assert.deepEqual(clipped.features[0].geometry.coordinates, [[0, 0.5], [1, 0.5]]);
  assert.deepEqual(clipped.features[1].geometry.coordinates, [[0.5, 1], [0.5, 0]]);
  assert.equal(mobilityLanes(data, 'bicycle', [0, 0, 1, 1]).features.length, 3);
  assert.equal(JSON.stringify(data), before, 'Do not mutate open data');
  assert.throws(() => mobilityLanes(data, 'car'), /Unknown mobility mode/);
  assert.throws(() => mobilityLanes({}, 'bicycle'), /Invalid mobility GeoJSON/);
  path.geometry.coordinates[0][0] = NaN;
  assert.throws(() => mobilityLanes(data, 'bicycle'), /Invalid mobility path coordinates/);
  path.properties.date_export = 'invalid';
  assert.throws(() => mobilityLanes(data, 'bicycle'), /Missing mobility path provenance/);
});

Given('the cycling and pedestrian example layers are open', { timeout: 60000 }, async function () {
  await this.context.route('**/api/explore/v2.1/catalog/datasets/**', fulfillTrafficRoute);
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper.html`, { waitUntil: 'domcontentloaded' });
  await this.page.waitForFunction(() => typeof layers !== 'undefined');
  await this.page.evaluate(async () => {
    const initialized = [];
    map.eachLayer(layer => { if (globals.sceneByLayer.get(layer).ready) initialized.push(globals.sceneByLayer.get(layer).ready); });
    await Promise.all(initialized);
    const attached = [];
    map.eachLayer(layer => { if (globals.sceneByLayer.get(layer)._added) attached.push(globals.sceneByLayer.get(layer)._added.promise); });
    await Promise.all(attached);
    for (const { name, overlay, layer } of layers._layers) {
      if ((!overlay || !['Traffic', 'Time'].includes(name)) && map.hasLayer(layer)) layer.remove();
      if (name === 'Traffic') layer.removeLayer(layer.getLayers()[0]);
    }
  });
});

Then('bicycles and pedestrians move with the clock and can be disabled and restored', { timeout: 180000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.waitForFunction(() => layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers()
    .every(layer => globals.sceneByLayer.get(layer).root?.children.some(mesh => mesh.extras.featureFaces.length)), null, { timeout: 120000 });
  const result = await this.page.evaluate(async () => {
    const out = [];
    const sunlightOverlay = layers._layers.find(entry => entry.name === 'Time').layer;
    globals.sceneByLayer.get(sunlightOverlay).control.live = false;
    globals.sceneByLayer.get(sunlightOverlay).control.time = new Date('2026-11-04T12:00:00Z');
    map.fire('simulationtimechange');
    await new Promise(resolve => setTimeout(resolve, 200));
    const group = layers._layers.find(entry => entry.name === 'Traffic').layer;
    for (const layer of group.getLayers()) {
      const name = layer.options.mobilityMode || layer.options.transitMode || 'car';
      const mesh = globals.sceneByLayer.get(layer).root.children[0], count = mesh.extras.featureFaces.length;
      const { device } = globals.sceneByLayer.get(layer).renderer;
      const read = device.createBuffer({ size: 48, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      const encoder = device.createCommandEncoder();
      encoder.copyBufferToBuffer(mesh.geometry.attributes.position.buffer, 0, read, 0, 48);
      device.queue.submit([encoder.finish()]);
      await read.mapAsync(GPUMapMode.READ);
      const first = new Float32Array(read.getMappedRange()).slice();
      read.unmap();
      const { placeTraffic } = await import('/src/traffic/placeTraffic.js');
      placeTraffic(globals.trafficByLayer.get(layer));
      let error = 0;
      for (let i = 0; i < first.length; i++) error = Math.max(error, Math.abs(first[i] - mesh.geometry.attributes.position.data[i]));
      globals.sceneByLayer.get(sunlightOverlay).control.time = new Date(globals.sceneByLayer.get(sunlightOverlay).control.time.getTime() + 1000);
      map.fire('simulationtimechange');
      const next = device.createCommandEncoder();
      next.copyBufferToBuffer(mesh.geometry.attributes.position.buffer, 0, read, 0, 48);
      device.queue.submit([next.finish()]);
      await read.mapAsync(GPUMapMode.READ);
      const second = new Float32Array(read.getMappedRange()).slice();
      read.unmap();
      read.destroy();
      out.push({ name, count, error, moved: Math.hypot(second[0] - first[0], second[2] - first[2]) > 0.1 });
    }
    return out;
  });
  for (const entry of result) {
    assert.ok(entry.count > 0, entry.name);
    assert.ok(entry.error < 0.02, `${entry.name}: GPU/picking mismatch ${entry.error}`);
    assert.ok(entry.moved, JSON.stringify(entry));
  }
  assert.equal(result.length, 6);
  const status = await this.page.locator('.traffic-status').allTextContents();
  assert.equal(status.length, 6);
  assert.deepEqual(status.sort(), result.map(({ count, name }) => `${count} ${name}`).sort());
  const control = this.page.getByRole('checkbox', { name: 'Traffic', exact: true });
  await control.uncheck();
  assert.equal(await this.page.evaluate(() => layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers()
    .every(layer => !map.hasLayer(layer) && !globals.sceneByLayer.get(layer).root.children.length && !globals.trafficByLayer.has(layer))), true);
  assert.equal(await this.page.locator('.traffic-status').count(), 0);
  await control.check();
  await this.page.waitForFunction(() => layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers()
    .every(layer => map.hasLayer(layer) && globals.sceneByLayer.get(layer).root.children.some(mesh => mesh.extras.featureFaces.length)));
  assert.equal(await this.page.locator('.traffic-status').count(), 6);
  await this.page.evaluate(() => map.remove());
  assert.deepEqual(errors, []);
});

Then('a 300 m lane with {int} vehicles per hour at {int} m\\/s holds {int} vehicles', function (flow, velocity, count) {
  assert.equal(vehicleOffsets(300, flow, velocity).length, count);
  if (velocity === globals.speed) assert.equal(vehicleOffsets(300, flow).length, count);
});

Then('a 300 m lane holds more than 3 times the vehicles at {int} than at {int} vehicles per hour', function (busy, quiet) {
  assert.ok(vehicleOffsets(300, busy).length > vehicleOffsets(300, quiet).length * 3);
});

Then('every vehicle of a 300 m lane at {int} vehicles per hour lies inside the lane', function (flow) {
  assert.ok(vehicleOffsets(300, flow).every(offset => offset > 0 && offset < 300));
});

const lane = [[0, 0, 10], [100, 0, 20], [100, 50, 20]], distances = [0, 100, 150];
const headings = { east: [1, 0], north: [0, 1] };
Then('long traffic routes preserve interpolation at endpoints and repeated coordinates', function () {
  const points = [], lengths = [];
  for (let i = 0; i <= 65536; i++) {
    points.push([i, 0, i / 2]);
    lengths.push(i);
  }
  const tracked = { lengths, reads: 0 };
  const indexed = new Proxy(lengths, { get: countLaneReads.bind(null, tracked) });
  assert.deepEqual(along(points, indexed, 65535.5),
    { x: 65535.5, y: 32767.75, z: 0, dx: 1, dz: 0 });
  assert.ok(tracked.reads < 32, `Expected logarithmic lookup, got ${tracked.reads} reads`);
  const repeated = [[0, 0, 0], [10, 0, 5], [10, 0, 5], [10, 10, 10]];
  const distances = [0, 10, 10, 20];
  assert.deepEqual(along(repeated, distances, 0), { x: 0, y: 0, z: 0, dx: 1, dz: 0 });
  assert.deepEqual(along(repeated, distances, 10), { x: 10, y: 5, z: 0, dx: 1, dz: 0 });
  assert.deepEqual(along(repeated, distances, 15), { x: 10, y: 7.5, z: 5, dx: 0, dz: 1 });
  assert.deepEqual(along(repeated, distances, 20), { x: 10, y: 10, z: 10, dx: 0, dz: 1 });
});

function countLaneReads(tracked, target, key) {
  if (/^\d+$/.test(String(key))) tracked.reads++;
  return target[key];
}

Then(/^along a (flat )?lane (\d+) m from the start is at x (\d+), height (\d+), z (\d+) heading (east|north)$/, function (flat, at, x, y, z, heading) {
  const points = flat ? lane.map(([px, pz]) => [px, pz]) : lane;
  const [dx, dz] = headings[heading];
  assert.deepEqual(along(points, distances, Number(at)), { x: Number(x), y: Number(y), z: Number(z), dx, dz });
});

Then('the Paris counting hour for {string} is {string}', function (time, hour) {
  const latest = Date.parse('2026-11-01T23:00:00Z');
  if (hour === 'error') assert.throws(() => trafficHour(time, latest));
  else assert.equal(trafficHour(time, latest).toISOString(), hour);
});

Then('at {string} the cruises in service are {string}', function (time, departures) {
  assert.deepEqual(cruises(time).map(trip => trip.departure), departures ? departures.split(', ') : []);
});

Then('the cruise departing at {string} is halfway at {string}', function (departure, time) {
  assert.equal(cruises(time).find(trip => trip.departure === departure).progress, 0.5);
});

Then('cruise progress grows from {string} to {string}', function (from, to) {
  assert.ok(cruises(to)[0].progress > cruises(from)[0].progress);
});

Then('cruises at {string} fail with {string}', function (time, error) {
  assert.throws(() => cruises(time), new RegExp(error));
});

Then('the cruise route ends where it starts', function () {
  assert.deepEqual(route[0], route.at(-1));
});

Then('the cruise route is between {int} and {int} km long', function (low, high) {
  let length = 0;
  for (let i = 1; i < route.length; i++) {
    const [lng0, lat0] = route[i - 1], [lng, lat] = route[i];
    length += Math.hypot((lat - lat0) * 111200, (lng - lng0) * 111200 * Math.cos(lat * Math.PI / 180));
  }
  // The 60-minute timetable then implies a plausible 3-4.5 m/s cruise speed.
  assert.ok(length > low * 1000 && length < high * 1000, `Route length ${length}`);
});

Then('the cruise route stays between latitudes {float} and {float} and longitudes {float} and {float}', function (south, north, west, east) {
  assert.ok(route.every(([lng, lat]) => lat > south && lat < north && lng > west && lng < east));
});

Then('cruise boats move along the river on scheduled trips and clean up when disabled', { timeout: 180000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.waitForFunction(() => globals.sceneByLayer.get(cruiseBoats)?.renderer && globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._terrainReady);
  await this.page.evaluate(() => {
    for (const { name, overlay, layer } of layers._layers) {
      if (overlay && !['Terrain (3D)', 'Traffic', 'Time'].includes(name)) layer.remove();
      if (name === 'Traffic') {
        for (const child of layer.getLayers()) if (child !== cruiseBoats) layer.removeLayer(child);
      }
    }
  });
  const result = await this.page.evaluate(async () => {
    const layer = cruiseBoats, owner = globals.renderers.get(map);
    const [{ along }, { scheduledTrips }] = await Promise.all([
      import(new URL('../src/traffic/along.js', location.href)),
      import(new URL('../src/traffic/scheduledTrips.js', location.href)),
    ]);
    const [cruise] = (await (await fetch('../examples/data/seine-cruises.geojson')).json()).features;
    const cruiseRoute = cruise.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const cruiseLengths = cruiseRoute.map((point, i) => i && map.distance(cruiseRoute[i - 1], point));
    cruiseLengths.forEach((length, i) => { if (i) cruiseLengths[i] += cruiseLengths[i - 1]; });
    const cruiseDistance = cruiseLengths.at(-1);
    const cruisePosition = progress => { const { x, z } = along(cruiseRoute, cruiseLengths, progress * cruiseDistance); return [x, z]; };
    // One batched mesh holds every boat; each boat owns a featureFaces vertex range.
    const boats = () => globals.sceneByLayer.get(layer).root.children.find(mesh => mesh.extras.featureFaces.length);
    const boatCount = () => boats()?.extras.featureFaces.length ?? 0;
    const stride = () => boats().extras.featureFaces[0].vertexEnd * 3;
    // Boats are placed by a compute pass: read the positions back from the GPU.
    const gpuPositions = async () => {
      const { buffer } = boats().geometry.attributes.position, { device } = globals.sceneByLayer.get(owner).renderer;
      const read = device.createBuffer({ size: buffer.size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      const encoder = device.createCommandEncoder();
      encoder.copyBufferToBuffer(buffer, 0, read, 0, buffer.size);
      device.queue.submit([encoder.finish()]);
      await read.mapAsync(GPUMapMode.READ);
      const data = new Float32Array(read.getMappedRange().slice(0));
      read.destroy();
      return data;
    };
    const firstBoat = async () => [...(await gpuPositions()).slice(0, stride())];
    const gpuErrors = [];
    globals.sceneByLayer.get(owner).renderer.device.addEventListener('uncapturederror', event => gpuErrors.push(event.error.message));
    const select = (day, minute) => {
      const container = globals.sceneByLayer.get(sunlightOverlay).control.getContainer();
      container.querySelector('input[type=date]').value = day;
      const slider = container.querySelector('input[type=range]');
      slider.value = String(minute); slider.dispatchEvent(new Event('input', { bubbles: true }));
      nativeChecks.render.render(owner);
    };
    select('2026-11-02', 120);
    const nightCount = boatCount();
    const route = globals.sceneByLayer.get(layer).root.children[0];
    const routeAtNight = route.geometry.drawRange.count > 100 && route.visible && route.extras.featureFaces.length === 0 &&
      route.program.depthTest && route.program.depthWrite && !route.program.transparent;
    select('2026-11-02', 555); // 09:15 UTC = first winter departure 10:15 Paris.
    const firstPosition = await firstBoat();
    select('2026-11-02', 565);
    const moved = (await firstBoat()).some((value, i) => value !== firstPosition[i]);
    const manualPosition = await firstBoat();
    await new Promise(resolve => setTimeout(resolve, 600));
    const frozen = (await firstBoat()).every((value, i) => value === manualPosition[i]);
    select('2026-11-02', 600);
    const twoTrips = boatCount();
    const properties = boats().extras.featureFaces.map(face => face.properties);
    // The hull's first vertex sits on the water surface.
    const positions = await gpuPositions();
    const heights = boats().extras.featureFaces.map(face => positions[face.vertexStart * 3 + 1] + globals.sceneByLayer.get(layer).root.position[1]);
    // The CPU copy used for picking must match the compute pass.
    nativeChecks.picking.raycast(layer, { clientX: 0, clientY: 0 });
    const cpuMatchesGpu = boats().geometry.attributes.position.data.every((value, i) => Math.abs(value - positions[i]) < 1e-3);
    const finite = positions.every(Number.isFinite) && globals.sceneByLayer.get(layer).root.children.every(mesh =>
      Object.values(mesh.geometry.attributes).every(attribute => [...attribute.data].every(Number.isFinite)));
    const tooltip = layer.options.tooltip({ properties: properties[0] }).textContent;
    const shared = globals.sceneByLayer.get(layer).renderer === globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D).renderer;
    const noDuplicateNodes = new Set(boats().extras.featureFaces.map(face => face.id)).size === twoTrips;
    select('2026-06-21', 600);
    // Exercise live ticking with a deterministic clock in an operating interval.
    const OriginalDate = Date, start = OriginalDate.parse('2026-06-21T10:00:01Z'), wall = performance.now();
    window.Date = class extends OriginalDate {
      constructor(...args) { super(...(args.length ? args : [start + performance.now() - wall])); }
      static now() { return start + performance.now() - wall; }
    };
    let liveMoved;
    try {
      globals.sceneByLayer.get(sunlightOverlay).control.getContainer().querySelector('button').click();
      await new Promise(resolve => setTimeout(resolve, 350));
      const before = await firstBoat();
      await new Promise(resolve => setTimeout(resolve, 600));
      liveMoved = (await firstBoat()).some((value, i) => value !== before[i]);
    } finally { window.Date = OriginalDate; globals.sceneByLayer.get(sunlightOverlay).control.live = false; }
    select('2026-11-02', 1290);
    const closed = boatCount() === 0 && globals.sceneByLayer.get(layer).root.children.length === 1 && globals.sceneByLayer.get(layer).root.children[0] === route;
    select('2026-11-02', 600);
    nativeChecks.picking.setHighlight(layer, { ...boats().extras.featureFaces[0], mesh: boats() });
    select('2026-11-02', 660);
    const clearedHighlight = !globals.sceneByLayer.get(layer).highlightedFeature;
    const date = globals.sceneByLayer.get(sunlightOverlay).control.getContainer().querySelector('input[type=date]');
    date.value = ''; date.dispatchEvent(new Event('change'));
    const invalidClears = boatCount() === 0;
    select('2026-11-02', 600);
    const recovered = boatCount() === 2 && boats().visible;
    const renderer = globals.sceneByLayer.get(owner).renderer, { device } = renderer;
    renderer.context.configure({ device, format: renderer.format, alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const capture = async () => {
      nativeChecks.render.render(owner);
      const width = renderer.canvas.width, height = renderer.canvas.height;
      const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
      const buffer = device.createBuffer({ size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const encoder = device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture: renderer.context.getCurrentTexture() }, { buffer, bytesPerRow }, [width, height]);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const pixels = new Uint8Array(buffer.getMappedRange()).slice();
      buffer.unmap(); buffer.destroy();
      return pixels;
    };
    let covered = 0;
    // DEM-only occlusion: the boat legitimately passes under bridge decks.
    const bridges = globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)._bridges;
    globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)._bridges = null;
    for (let distance = 0; distance < cruiseDistance; distance += 10) {
      const position = cruisePosition(distance / cruiseDistance);
      if (nativeChecks.getElevation(globals.cameraByMap.get(map)._terrain3D, position) > 27.18) covered += 10;
    }
    globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)._bridges = bridges;
    const riverCoverage = covered / cruiseDistance;
    testOperations.setPitch(map, 0); testOperations.setBearing(map, 0); map.fitBounds(cruiseRoute, { animate: false });
    const overview = await capture();
    route.visible = false;
    const overviewNoRoute = await capture();
    let overviewRoutePixels = 0;
    for (let i = 0; i < overview.length; i += 4) {
      if (Math.abs(overview[i] - overviewNoRoute[i]) + Math.abs(overview[i + 1] - overviewNoRoute[i + 1]) +
        Math.abs(overview[i + 2] - overviewNoRoute[i + 2]) > 15) overviewRoutePixels++;
    }
    route.visible = true;
    testOperations.setPitch(map, 45); testOperations.setBearing(map, 25); map.setView(cruisePosition(scheduledTrips('2026-11-02T10:00:00Z', cruise.properties.timetable)[0].progress), 19, { animate: false });
    const visible = await capture();
    boats().visible = false;
    const noBoats = await capture();
    route.visible = false;
    const noRoute = await capture();
    let boatPixels = 0, routePixels = 0;
    for (let i = 0; i < visible.length; i += 4) {
      if (Math.abs(visible[i] - noBoats[i]) + Math.abs(visible[i + 1] - noBoats[i + 1]) +
        Math.abs(visible[i + 2] - noBoats[i + 2]) > 15) boatPixels++;
      if (Math.abs(noRoute[i] - noBoats[i]) + Math.abs(noRoute[i + 1] - noBoats[i + 1]) +
        Math.abs(noRoute[i + 2] - noBoats[i + 2]) > 15) routePixels++;
    }
    for (const mesh of globals.sceneByLayer.get(layer).root.children) mesh.visible = true;
    window.previousBoatBuffers = globals.sceneByLayer.get(layer).root.children.flatMap(mesh => Object.values(mesh.geometry.attributes).map(a => a.buffer));
    await globals.sceneByLayer.get(owner).renderer.device.queue.onSubmittedWorkDone();
    return { nightCount, moved, frozen, twoTrips, properties, heights, finite, cpuMatchesGpu, tooltip, shared,
      noDuplicateNodes, liveMoved, closed, gpuErrors, routeAtNight,
      invalidClears, recovered, clearedHighlight, boatPixels, routePixels, riverCoverage, overviewRoutePixels };
  });
  assert.equal(result.nightCount, 0);
  assert.equal(result.twoTrips, 2);
  assert.deepEqual(result.properties.map(trip => trip.departure), ['10:15', '11:00']);
  assert.ok(result.heights.every(height => Math.abs(height - 27.15) < 1e-4), String(result.heights));
  for (const key of ['moved', 'frozen', 'finite', 'cpuMatchesGpu', 'shared', 'noDuplicateNodes', 'liveMoved',
    'closed', 'routeAtNight', 'invalidClears', 'recovered', 'clearedHighlight']) {
    assert.equal(result[key], true, key);
  }
  assert.match(result.tooltip, /not live GPS/);
  assert.deepEqual(result.gpuErrors, []);
  assert.ok(result.boatPixels > 50, `Visible boat pixels: ${result.boatPixels}`);
  assert.ok(result.routePixels > 50, `Visible route pixels: ${result.routePixels}`);
  assert.ok(result.overviewRoutePixels > 100, `Visible route in overview: ${result.overviewRoutePixels}`);
  assert.ok(result.riverCoverage < 0.01, `Less than 1% terrain occlusion (e.g. bridge decks): ${result.riverCoverage}`);
  const control = this.page.getByRole('checkbox', { name: 'Traffic', exact: true });
  await control.uncheck();
  assert.equal(await this.page.evaluate(() => !cruiseBoats._map && !globals.sceneByLayer.get(cruiseBoats).root.children.length &&
    ![...document.querySelectorAll('.traffic-status')].some(status => status.textContent.includes('estimated, not live GPS'))), true);
  await control.check();
  await this.page.waitForFunction(() => globals.sceneByLayer.get(cruiseBoats).root.children.length === 2);
  assert.equal(await this.page.evaluate(() => globals.sceneByLayer.get(cruiseBoats).root.children.every(mesh =>
    Object.values(mesh.geometry.attributes).every(a => !previousBoatBuffers.includes(a.buffer)))), true);
  // Without a clock the boats run live on the current timetable.
  await this.page.evaluate(() => map.removeLayer(sunlightOverlay));
  assert.equal(await this.page.evaluate(async () => {
    const { scheduledTrips } = await import(new URL('../src/traffic/scheduledTrips.js', location.href));
    const [cruise] = (await (await fetch('../examples/data/seine-cruises.geojson')).json()).features;
    await new Promise(requestAnimationFrame);
    const boats = globals.sceneByLayer.get(cruiseBoats).root.children.find(mesh => mesh.extras.featureFaces.length);
    return (boats?.extras.featureFaces.length ?? 0) === scheduledTrips(new Date(), cruise.properties.timetable).length;
  }), true);
  assert.deepEqual(errors, []);
});
