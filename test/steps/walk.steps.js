import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { local } from '../../src/projections/walkerLocalPosition.js';
import { insideMesh } from '../../src/collision/insideMesh.js';
import { trafficCollision } from '../../src/collision/trafficCollision.js';
import { onAdd as addWalk } from '../../src/walk/onAddWalkControl.js';
import { onRemove as removeWalk } from '../../src/walk/onRemoveWalkControl.js';
import { rootByLayer } from '../../src/weakmaps/rootByLayer.js';
import { trafficByLayer } from '../../src/weakmaps/trafficByLayer.js';

Then('walk collision detects enclosed instances and moving traffic', function () {
  const positions = new Float32Array([
    -1, 0, -1, -1, 2, -1, -1, 2, 1, -1, 0, -1, -1, 2, 1, -1, 0, 1,
    1, 0, -1, 1, 2, 1, 1, 2, -1, 1, 0, -1, 1, 0, 1, 1, 2, 1,
    -1, 0, -1, 1, 0, -1, 1, 2, -1, -1, 0, -1, 1, 2, -1, -1, 2, -1,
    -1, 0, 1, 1, 2, 1, 1, 0, 1, -1, 0, 1, -1, 2, 1, 1, 2, 1,
  ]);
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const mesh = {
    visible: true,
    worldMatrix: identity,
    program: {},
    geometry: { attributes: {
      position: { data: positions, size: 3, count: positions.length / 3 },
      instanceOffset: { data: new Float32Array([5, 0, 0, 0]), size: 4, count: 1 },
    } },
  };
  const seen = new Set(), intersections = [];
  assert.equal(insideMesh(mesh, 5, 1, 0, seen, intersections), true);
  assert.equal(insideMesh(mesh, 8, 1, 0, seen, intersections), false);

  const traffic = {}, lane = { points: [[5, 0, 0], [15, 0, 0]], lengths: [0, 10], length: 10 };
  rootByLayer.set(traffic, { position: [0, 0, 0], scale: [1, 1, 1] });
  trafficByLayer.set(traffic, {
    mesh: {}, trips: [{ lane, distance: 0, speed: 0 }], template: { position: [-1, 0, -1, 1, 1.5, 1] },
    elapsed: 0, side: 0,
  });
  const data = { best: 10, found: false, normal: [0, 0] };
  assert.equal(trafficCollision(traffic, 0, 0, 0, 1, 0, 10, data), true);
  assert.ok(data.best > 3 && data.best < 4);
  assert.equal(data.normal[0], -1);
  data.best = 10;
  data.found = false;
  assert.equal(trafficCollision(traffic, 0, -10, 0, 1, 0, 10, data), false);
});

Then('Walk scratch stays map-owned across control replacement', function () {
  const firstMap = {}, secondMap = {};
  const makeControl = function () {
    return {
      _walk: {
        container: {},
        stop() {},
        layer: { addTo(map) { this._map = map; }, remove() { this._map = null; } },
      },
    };
  };
  const first = makeControl(), replacement = makeControl(), other = makeControl();
  assert.equal(addWalk.call(first, firstMap), first._walk.container);
  const state = globals.walkByMap.get(firstMap);
  const hitData = first._walk.hitData, local = first._walk.local;
  assert.throws(() => addWalk.call(replacement, firstMap), /Only one Walk/);
  assert.equal(state.control, first);
  removeWalk.call(replacement, firstMap);
  assert.equal(state.control, first);
  addWalk.call(other, secondMap);
  assert.notEqual(other._walk.hitData, hitData);
  assert.notEqual(other._walk.local, local);
  local[0] = 123;
  hitData.seen.add({});
  removeWalk.call(first, firstMap);
  assert.equal(state.control, null);
  assert.equal(hitData.seen.size, 0);
  assert.equal(first._walk.hitData, null);
  assert.equal(first._walk.local, null);
  addWalk.call(replacement, firstMap);
  assert.equal(globals.walkByMap.get(firstMap), state);
  assert.equal(replacement._walk.hitData, hitData);
  assert.equal(replacement._walk.local, local);
  assert.deepEqual(local, [0, 0, 0]);
  removeWalk.call(replacement, firstMap);
  const secondHit = other._walk.hitData;
  removeWalk.call(other, secondMap);
  addWalk.call(replacement, secondMap);
  assert.equal(replacement._walk.hitData, secondHit);
  assert.notEqual(replacement._walk.hitData, hitData);
  removeWalk.call(replacement, secondMap);
});

Then('Time state stays map-owned across control replacement', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(() => {
    const map = test3d.map;
    const node = document.createElement('div');
    node.style.cssText = 'width:400px;height:300px';
    document.body.append(node);
    const otherMap = new L.Map(node).setView([0, 0], 5);
    const first = new L.Control.Time().addTo(map);
    const replacement = new L.Control.Time();
    const other = new L.Control.Time().addTo(otherMap);
    try {
      const state = globals.sunByMap.get(map);
      const otherState = globals.sunByMap.get(otherMap);
      let rejected = false;
      try { replacement.addTo(map); } catch (error) { rejected = /Only one Time/.test(error.message); }
      let layerRejected = false;
      try { replacement.layer.addTo(map); } catch (error) {
        layerRejected = /Only one Time/.test(error.message) && !map.hasLayer(replacement.layer) && !replacement.layer._map;
      }
      const ownerUnchanged = globals.cameraByMap.get(map)._timeControl === first && state.control === first;
      const isolated = state !== otherState && state.projection !== otherState.projection &&
        state.container !== otherState.container && state.sunDisc !== otherState.sunDisc;
      first.live = false;
      first.time = new Date('2026-06-21T12:00:00Z');
      state.update();
      const snapshot = globals.cameraByMap.get(map)._sunlight;
      first.remove();
      const released = state.control === null && !state.container.isConnected &&
        !globals.sunlightByControl.has(first);
      replacement.live = false;
      replacement.time = new Date('2026-12-21T06:00:00Z');
      replacement.addTo(map);
      const reused = globals.sunByMap.get(map) === state && globals.sunlightByControl.get(replacement) === state &&
        state.control === replacement && replacement.getContainer() === state.container &&
        state.date.value === '2026-12-21';
      const events = [];
      const capture = event => events.push(event);
      map.on('simulationtimechange', capture);
      map.fire('moveend');
      map.off('simulationtimechange', capture);
      const singleListener = events.length === 1 && events[0].time.getTime() === replacement.time.getTime();
      const independent = globals.cameraByMap.get(map)._sunlight !== snapshot &&
        globals.cameraByMap.get(otherMap)._timeControl === other && otherState.control === other;
      replacement.remove();
      map.getContainer().style.setProperty('--leaflet-sky-background', 'pink');
      first.addTo(map);
      first.remove();
      const skyRestored = map.getContainer().style.getPropertyValue('--leaflet-sky-background') === 'pink';
      map.getContainer().style.removeProperty('--leaflet-sky-background');
      return { rejected, layerRejected, ownerUnchanged, isolated, released, reused, singleListener, independent, skyRestored };
    } finally {
      first.remove();
      replacement.remove();
      other.remove();
      otherMap.remove();
      node.remove();
    }
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('walk coordinate conversion reuses only its caller-owned buffer', function () {
  const project = function (point) {
    return { x: point.lng * 2, y: point.lat * 3 };
  };
  const layer = {
    location: { lat: 10, lng: 20 },
    root: { position: [0, 5, 0] },
    _map: { options: { crs: { project } } },
  };
  globals.sceneByLayer.set(layer, layer);
  globals.cameraByMap.set(layer._map, layer._map);
  const first = [0, 0, 0], second = [0, 0, 0];
  const a = local.call({ layer, state: { latlng: { lat: 11, lng: 21 } } }, first);
  const b = local.call({ layer, state: { latlng: { lat: 12, lng: 22 } } }, second);
  assert.equal(a, first);
  assert.equal(b, second);
  assert.notEqual(a, b);
  assert.deepEqual(a, [2 * Math.cos(10 * Math.PI / 180), -5, -3 * Math.cos(10 * Math.PI / 180)]);
  assert.deepEqual(b, [4 * Math.cos(10 * Math.PI / 180), -5, -6 * Math.cos(10 * Math.PI / 180)]);
});

Then('Time and Walk controls clean up and can be added again', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const { trafficNow } = await import('/src/traffic/trafficNow.js');
    const traffic = { layer: { _map: map } };
    const time = new L.Control.Time({ position: 'topleft' }).addTo(map);
    const standalone = time instanceof L.Control && time.getPosition() === 'topleft' &&
      time.getContainer().parentNode === map._controlCorners.topleft && !!globals.cameraByMap.get(map)._sunlight;
    time.getContainer().querySelector('input[type=date]').value = '2026-06-21';
    const slider = time.getContainer().querySelector('input[type=range]');
    slider.value = '720';
    slider.dispatchEvent(new Event('input'));
    const selected = time.time.getTime();
    const trafficTime = !trafficNow(traffic).live && trafficNow(traffic).time.getTime() === selected;
    time.remove();
    const timeRemoved = !globals.cameraByMap.get(map)._sunlight && !time.getContainer().isConnected && trafficNow(traffic).live;
    time.layer.addTo(map);
    const LayersControl = L.LayersControl || L.Control.Layers;
    const layers = new LayersControl({}, { Shadows: time.layer }).addTo(map);
    await new Promise(resolve => queueMicrotask(resolve));
    const nested = layers.getContainer().contains(time.getContainer()) &&
      !time.getContainer().classList.contains('leaflet-control') && time.time.getTime() === selected;
    layers.getContainer().querySelector('input').click();
    const unchecked = !map.hasLayer(time.layer) && !globals.cameraByMap.get(map)._sunlight && !time.getContainer().isConnected;
    layers.getContainer().querySelector('input').click();
    await new Promise(resolve => queueMicrotask(resolve));
    const rechecked = map.hasLayer(time.layer) && !!globals.cameraByMap.get(map)._sunlight &&
      layers.getContainer().contains(time.getContainer()) && time.time.getTime() === selected;
    time.remove();
    const adapterRemoved = !map.hasLayer(time.layer) && !globals.cameraByMap.get(map)._sunlight;
    time.addTo(map);
    const restoredStandalone = time.getContainer().parentNode === map._controlCorners.topleft;
    time.remove();
    layers.remove();

    const control = new L.Control.Walk({ speed: 6 }).addTo(map);
    await nativeChecks.ready(control._walk.layer);
    const scratch = globals.walkByMap.get(map);
    const duplicate = new L.Control.Walk();
    let duplicateRejected = false;
    try { duplicate.addTo(map); } catch (error) { duplicateRejected = /Only one Walk/.test(error.message); }
    const ownerUnchanged = scratch.control === control && map.hasLayer(control._walk.layer) && !duplicate._map;
    const before = { zoom: map.getZoom(), pitch: testOperations.getPitch(map), dragging: map.dragging.enabled() };
    control.getContainer().querySelector('button').click();
    const walking = control instanceof L.Control && !!control.walker.latlng && !map.dragging.enabled();
    control.remove();
    const walkRemoved = !map.hasLayer(control._walk.layer) && !control.getContainer().isConnected &&
      map.getZoom() === before.zoom && testOperations.getPitch(map) === before.pitch &&
      map.dragging.enabled() === before.dragging && !control._walk.meshes;
    control.addTo(map);
    await globals.sceneByLayer.get(control._walk.layer)._added.promise;
    const scratchReused = globals.walkByMap.get(map) === scratch && control._walk.hitData === scratch.hitData &&
      control._walk.local === scratch.local;
    control.getContainer().querySelector('button').click();
    const restarted = control.getContainer().querySelector('button').getAttribute('aria-pressed') === 'true';
    control.remove();
    duplicate.addTo(map);
    await nativeChecks.ready(duplicate._walk.layer);
    const replacementReused = globals.walkByMap.get(map) === scratch && scratch.control === duplicate;
    duplicate.remove();
    return { standalone, trafficTime, timeRemoved, nested, unchecked, rechecked, adapterRemoved,
      restoredStandalone, walking, walkRemoved, restarted, duplicateRejected, ownerUnchanged, scratchReused, replacementReused };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('keyboard walking moves toward a wall, stops at it and can move away', { timeout: 30000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.evaluate(async () => {
    const map = test3d.map;
    testOperations.setBearing(map, 0);
    const wall = new L.Layer({ source: { type: 'vector' } }).addTo(map);
    await nativeChecks.ready(wall);
    nativeChecks.gpu.createMesh(wall, {
      position: [-10, 0, -4, 10, 0, -4, 10, 4, -4, -10, 0, -4, 10, 4, -4, -10, 4, -4],
      normal: Array(6).fill([0, 0, 1]).flat(),
      color: Array(18).fill(0.5),
    });
    const control = window.walkControl = new L.Control.Walk({ speed: 6 }).addTo(map);
    await nativeChecks.ready(control._walk.layer);
  });
  const button = this.page.getByRole('button', { name: 'Walk', exact: true });
  await button.click();
  await this.page.waitForFunction(() => {
    const walk = Object.values(test3d.map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return globals.sceneByLayer.get(walk).root.children.length === 5;
  });
  const start = await this.page.evaluate(() => {
    const walk = Object.values(test3d.map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return { lat: globals.sceneByLayer.get(walk).walker.latlng.lat, phase: globals.sceneByLayer.get(walk).walker.phase };
  });
  await this.page.keyboard.down('KeyW');
  try {
    await this.page.waitForFunction(lat => {
      const walk = Object.values(test3d.map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
      return (globals.sceneByLayer.get(walk).walker.latlng.lat - lat) * 111320 > 0.5;
    }, start.lat);
    await this.page.waitForTimeout(1200);
  } finally {
    await this.page.keyboard.up('KeyW');
  }
  const stopped = await this.page.evaluate(() => {
    const walk = Object.values(test3d.map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return { lat: globals.sceneByLayer.get(walk).walker.latlng.lat, phase: globals.sceneByLayer.get(walk).walker.phase,
      centerError: test3d.map.latLngToContainerPoint(globals.sceneByLayer.get(walk).walker.latlng).distanceTo(test3d.map.getSize().divideBy(2)) };
  });
  const travelled = (stopped.lat - start.lat) * 111320;
  assert.ok(travelled > 2.5 && travelled < 4, `Stopped before the 4 m wall: ${travelled} m`);
  assert.ok(stopped.phase > start.phase, 'Walking advances the limb animation');
  assert.deepEqual(errors, [], 'Keyboard movement must not throw during collision checks');
  assert.ok(stopped.centerError < 1.5, `The map follows the walker within pixel rounding: ${JSON.stringify(stopped)}`);
  await this.page.keyboard.down('KeyS');
  try {
    await this.page.waitForFunction(lat => {
      const walk = Object.values(test3d.map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
      return (lat - globals.sceneByLayer.get(walk).walker.latlng.lat) * 111320 > 0.5;
    }, stopped.lat);
  } finally {
    await this.page.keyboard.up('KeyS');
  }
  const jumped = await this.page.evaluate(startLat => {
    const walk = walkControl._walk;
    cancelAnimationFrame(walk.frame);
    let now = performance.now();
    walk.last = now;
    const advance = ticks => {
      for (let i = 0; i < ticks; i++) {
        walk.step(now += 100);
        cancelAnimationFrame(walk.frame);
      }
    };
    const press = repeat => document.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'Space', key: ' ', repeat, bubbles: true, cancelable: true,
    }));
    const prevented = !press(false);
    advance(10);
    const first = walk.state.height, velocity = walk.verticalSpeed;
    press(true);
    const repeatUnaffected = walk.verticalSpeed === velocity;
    advance(50);
    const second = walk.state.height;
    const input = document.body.appendChild(document.createElement('input'));
    input.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    const releasedInInput = !walk.keys.has('Space');
    const textEvent = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    input.dispatchEvent(textEvent);
    const textUnaffected = !textEvent.defaultPrevented && !walk.keys.has('Space');
    input.remove();
    advance(15);
    const falling = walk.verticalSpeed < 0 && walk.state.height < second;
    press(false);
    advance(10);
    const third = walk.state.height;
    const feet = walk.meshes[0].position[1] + globals.sceneByLayer.get(walk.layer).root.position[1];
    walk.state.latlng = new L.LatLng(startLat, walk.state.latlng.lng);
    walk.keys.add('KeyW');
    advance(10);
    walk.keys.clear();
    const landingLat = walk.state.latlng.lat;
    advance(40);
    const landed = walk.state.height === 0 && walk.verticalSpeed === 0 &&
      Math.abs(walk.meshes[0].position[1] + globals.sceneByLayer.get(walk.layer).root.position[1]) < 0.001;
    press(false);
    advance(1);
    const jumpedAgain = walk.state.height > 0;
    window.dispatchEvent(new Event('blur'));
    const blurred = !walk.keys.has('Space');
    advance(15);
    const landedAfterBlur = walk.state.height === 0;
    press(false);
    advance(1);
    return { prevented, repeatUnaffected, releasedInInput, textUnaffected, first, second, third,
      feet, falling, landed, jumpedAgain, blurred, landedAfterBlur, landingLat };
  }, start.lat);
  assert.equal(jumped.prevented, true, 'Space must not scroll the page or activate the Walk button');
  assert.equal(jumped.repeatUnaffected, true);
  assert.equal(jumped.releasedInInput, true);
  assert.equal(jumped.textUnaffected, true);
  assert.ok(Math.abs(jumped.first - 6) < 0.001 && Math.abs(jumped.second - 36) < 0.001,
    `Holding Space continuously ascends at 6 m/s without repeat events: ${JSON.stringify(jumped)}`);
  assert.ok(jumped.third > jumped.second, 'Holding Space again resumes ascent in mid-air');
  assert.equal(jumped.falling, true, 'Releasing Space restores gravity');
  assert.ok(Math.abs(jumped.feet - jumped.third) < 0.001, 'The rendered walker follows jump height');
  assert.ok((jumped.landingLat - start.lat) * 111320 > 4.3, 'Airborne walker must pass over the 4 m wall');
  assert.equal(jumped.landed, true, 'Gravity returns the walker exactly to ground');
  assert.equal(jumped.jumpedAgain, true, 'Space still works after landing');
  assert.equal(jumped.blurred, true, 'Losing window focus releases Space');
  assert.equal(jumped.landedAfterBlur, true, 'Losing window focus restores gravity');
  const rooftop = await this.page.evaluate(async () => {
    const walk = walkControl._walk, state = globals.sceneByLayer.get(walk.layer);
    const roof = new L.Layer({ source: { type: 'vector' } }).addTo(test3d.map);
    await nativeChecks.ready(roof);
    const root = globals.sceneByLayer.get(roof).root;
    const x = walk.meshes[0].position[0] + state.root.position[0] - root.position[0];
    const z = walk.meshes[0].position[2] + state.root.position[2] - root.position[2];
    const y = 8 - root.position[1];
    nativeChecks.gpu.createMesh(roof, {
      position: [x-2,y,z-2, x-2,y,z+2, x+2,y,z+2, x-2,y,z-2, x+2,y,z+2, x+2,y,z-2],
      normal: Array(6).fill([0, 1, 0]).flat(), color: Array(18).fill(0.5),
    });
    let now = walk.last;
    const advance = ticks => {
      for (let i = 0; i < ticks; i++) { walk.step(now += 100); cancelAnimationFrame(walk.frame); }
      nativeChecks.render.render(state._shared);
    };
    advance(30);
    const cameraError = Math.abs(state.camera.target[1] - walk.state.height);
    const p = new DOMPoint(0, 0, 0, 1);
    const feetY = walk.meshes[0].position[1] + state.root.position[1];
    p.x = state.camera.target[0]; p.y = feetY; p.z = state.camera.target[2];
    const projected = p.matrixTransform(new DOMMatrix(state.camera.projectionViewMatrix));
    const screenError = Math.abs(projected.y / projected.w);
    walk.keys.delete('Space');
    advance(40);
    const landed = walk.state.height, velocity = walk.verticalSpeed;
    advance(20);
    const stable = walk.state.height;
    walk.keys.add('Space'); advance(10);
    const relaunched = walk.state.height > stable + 5;
    walk.keys.delete('Space'); advance(40);
    walk.keys.add('KeyW'); advance(15); walk.keys.clear(); advance(30);
    const offRoof = walk.state.height;
    roof.remove();
    return { cameraError, screenError, landed, velocity, stable, relaunched, offRoof };
  });
  assert.ok(rooftop.cameraError < 0.001 && rooftop.screenError < 0.001,
    `Camera follows vertical-only ascent: ${JSON.stringify(rooftop)}`);
  assert.ok(Math.abs(rooftop.landed - 8) < 0.001 && Math.abs(rooftop.stable - 8) < 0.001,
    `Walker lands on the roof and stays there: ${JSON.stringify(rooftop)}`);
  assert.equal(rooftop.velocity, 0);
  assert.equal(rooftop.relaunched, true, 'Space ascends from the roof');
  assert.equal(rooftop.offRoof, 0, 'Walking off the roof falls back to terrain');
  await this.page.keyboard.press('Escape');
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  assert.deepEqual(await this.page.evaluate(() => ({
    height: walkControl.walker.height, speed: walkControl._walk.verticalSpeed,
  })), { height: 0, speed: 0 }, 'Exiting clears airborne state');
  assert.equal(await this.page.evaluate(() => {
    const state = globals.sceneByLayer.get(walkControl._walk.layer);
    nativeChecks.render.render(state._shared);
    return state.camera.target[1];
  }), 0, 'Exiting restores the ground-level camera target');
  assert.deepEqual(errors, [], 'Keyboard movement must not throw during collision checks');
});

Then('the walk layer moves the pedestrian on Pont d\'Iéna, stops it at walls and Esc restores the map', { timeout: 30000 }, async function () {
  await this.page.waitForFunction(() => globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._bridgeMesh, null, { timeout: 30000 });
  await this.page.evaluate(() => {
    for (const { name, overlay, layer } of layers._layers) {
      if (overlay && !['Terrain (3D)', 'Buildings'].includes(name)) layer.remove();
    }
  });
  // Pont d'Iéna deck, about 9 m above the DEM's riverbed.
  await this.page.evaluate(() => map.setView([48.8597, 2.2924], 17, { animate: false }));
  const before = await this.page.evaluate(() => ({ zoom: map.getZoom(), pitch: testOperations.getPitch(map) }));
  const button = this.page.getByRole('button', { name: 'Walk', exact: true });
  // Not in the layers control: a map button outside it.
  assert.equal(await this.page.locator('.leaflet-control-layers').getByText('Walk', { exact: true }).count(), 0);
  await button.click();
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  await this.page.waitForFunction(() => {
    const walk = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return globals.sceneByLayer.get(walk).walker.latlng && globals.sceneByLayer.get(walk).root.children.length === 5;
  });
  const state = () => this.page.evaluate(() => {
    const walk = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk'), [body] = globals.sceneByLayer.get(walk).root.children;
    return {
      ...globals.sceneByLayer.get(walk).walker.latlng, heading: globals.sceneByLayer.get(walk).walker.heading, bearing: testOperations.getBearing(map), pitch: testOperations.getPitch(map),
      dragging: map.dragging.enabled(), center: map.getCenter(),
      feet: body.position[1] + globals.sceneByLayer.get(walk).root.position[1], deck: nativeChecks.getElevation(globals.cameraByMap.get(map)._terrain3D, globals.sceneByLayer.get(walk).walker.latlng),
    };
  });
  const start = await state();
  assert.equal(start.pitch, 75);
  assert.equal(start.dragging, false);
  assert.ok(start.deck > 35 && start.deck < 37, `Deck elevation: ${start.deck}`);
  assert.ok(Math.abs(start.feet - start.deck) < 0.01, `Feet ${start.feet} on deck ${start.deck}`);

  await this.page.keyboard.down('KeyW');
  await this.page.waitForTimeout(300);
  await this.page.keyboard.up('KeyW');
  await this.page.waitForFunction(() => {
    const buildings = layers._layers.find(entry => entry.name === 'Buildings').layer;
    return globals.sceneByLayer.get(buildings)._inflight === 0 &&
      [...globals.sceneByLayer.get(buildings)._areas.values()].every(area => area.done);
  });
  await this.page.waitForFunction(() => walk._walk.nextClearanceCheck > performance.now());
  const walked = await state();
  const north = (walked.lat - start.lat) * 111320, east = (walked.lng - start.lng) * 111320 * Math.cos(start.lat * Math.PI / 180);
  const view = -start.bearing * Math.PI / 180;
  assert.ok(Math.hypot(north, east) > 1, `Walked ${Math.hypot(north, east)} m`);
  assert.ok((north * Math.cos(view) + east * Math.sin(view)) / Math.hypot(north, east) > 0.99, 'W walks along the view direction');
  assert.ok(Math.abs(walked.center.lat - walked.lat) < 1e-6 && Math.abs(walked.center.lng - walked.lng) < 1e-6, 'The camera follows the walker');

  const box = await this.page.locator('#map').boundingBox();
  await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await this.page.mouse.down();
  await this.page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2, { steps: 5 });
  await this.page.mouse.up();
  const looked = await state();
  assert.ok(Math.abs(looked.bearing - walked.bearing - 25) < 0.5, `Drag turns the camera: ${walked.bearing} -> ${looked.bearing}`);
  assert.ok(Math.abs(looked.lat - walked.lat) < 1e-9 && Math.abs(looked.lng - walked.lng) < 1e-9,
    `Dragging does not move the walker: ${JSON.stringify({ walked, looked })}`);

  await this.page.keyboard.down('KeyD');
  await this.page.keyboard.down('KeyW');
  await this.page.waitForFunction(heading => {
    const walk = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return globals.sceneByLayer.get(walk).walker.heading > heading + 0.6;
  }, looked.heading);
  await this.page.keyboard.up('KeyD');
  await this.page.waitForFunction(() => {
    const walk = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    return Math.abs(((-globals.sceneByLayer.get(walk).walker.heading * 180 / Math.PI - testOperations.getBearing(map)) % 360 + 540) % 360 - 180) < 5;
  });
  await this.page.keyboard.up('KeyW');
  const turned = await state();
  const behind = Math.abs(((-turned.heading * 180 / Math.PI - turned.bearing) % 360 + 540) % 360 - 180);
  assert.ok(turned.heading > looked.heading + 0.5, `D turns right: ${looked.heading} -> ${turned.heading}`);
  assert.ok(behind < 5, `The camera follows behind the walker: ${behind}°`);

  // Champ de Mars side street: turn into the first nearby facade after sliding along it.
  await this.page.evaluate(() => {
    const walk = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk');
    globals.sceneByLayer.get(walk).walker.latlng = new L.LatLng(48.8560, 2.2950);
    globals.sceneByLayer.get(walk).walker.heading = Math.PI;
    map.setView(globals.sceneByLayer.get(walk).walker.latlng, map.getZoom(), { animate: false });
  });
  await this.page.waitForFunction(() => {
    const buildings = layers._layers.find(entry => entry.name === 'Buildings').layer;
    return globals.sceneByLayer.get(buildings)._areas.size > 0 && globals.sceneByLayer.get(buildings)._inflight === 0 &&
      [...globals.sceneByLayer.get(buildings)._areas.values()].every(area => area.done);
  });
  await this.page.keyboard.down('KeyW');
  let previous, stoppedSamples = 0, aiming = false;
  for (let i = 0; i < 100 && stoppedSamples < 3; i++) {
    await this.page.waitForTimeout(300);
    const { lat, lng } = await state();
    if (!aiming && (48.8560 - lat) * 111320 > 40) {
      aiming = await this.page.evaluate(async () => {
        const { local } = await import('/src/projections/walkerLocalPosition.js');
        const { hit } = await import('/src/picking/hit.js');
        const context = walk._walk, root = globals.sceneByLayer.get(context.layer).root;
        const feet = local.call(context, context.local);
        for (let n = 0; n < feet.length; n++) feet[n] = root.position[n] + root.scale[n] * feet[n];
        const normal = hit(context.layer, ...feet, 0, 1, 5, context.hitData);
        if (!normal) return false;
        context.state.heading = Math.atan2(-normal[0], normal[1]);
        return true;
      });
    }
    stoppedSamples = aiming && previous && Math.hypot(lat - previous.lat, lng - previous.lng) < 1e-7
      ? stoppedSamples + 1 : 0;
    previous = { lat, lng };
  }
  await this.page.keyboard.up('KeyW');
  const south = (48.8560 - previous.lat) * 111320;
  assert.ok(aiming, 'A building facade is visible ahead');
  assert.equal(stoppedSamples, 3, 'A building stops the walker');
  assert.ok(south > 40 && south < 120, `Stopped ${south} m south, at the facade`);
  assert.equal(await this.page.evaluate(async () => {
    const { local } = await import('/src/projections/walkerLocalPosition.js');
    const { hit } = await import('/src/picking/hit.js');
    const context = walk._walk, root = globals.sceneByLayer.get(context.layer).root;
    const feet = local.call(context, context.local);
    for (let n = 0; n < feet.length; n++) feet[n] = root.position[n] + root.scale[n] * feet[n];
    return Boolean(hit(context.layer, ...feet, Math.sin(context.state.heading), -Math.cos(context.state.heading),
      2, context.hitData));
  }), true, 'The stopped walker faces a nearby facade');

  await this.page.keyboard.press('Escape');
  const after = await this.page.evaluate(() => ({
    dragging: map.dragging.enabled(), zoom: map.getZoom(), pitch: testOperations.getPitch(map),
    meshes: globals.sceneByLayer.get(Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._type === 'walk')).root.children.length,
  }));
  assert.deepEqual(after, { dragging: true, zoom: before.zoom, pitch: before.pitch, meshes: 0 });
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  // The button toggles too.
  await button.click();
  assert.equal(await this.page.evaluate(() => map.dragging.enabled()), false);
  await button.click();
  assert.equal(await this.page.evaluate(() => map.dragging.enabled()), true);
});
