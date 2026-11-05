import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { local } from '../../src/walk/local.js';

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
    const layers = new L.Control.Layers({}, { Shadows: time.layer }).addTo(map);
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
    const before = { zoom: map.getZoom(), pitch: testOperations.getPitch(map), dragging: map.dragging.enabled() };
    control.getContainer().querySelector('button').click();
    const walking = control instanceof L.Control && !!control.walker.latlng && !map.dragging.enabled();
    control.remove();
    const walkRemoved = !map.hasLayer(control._walk.layer) && !control.getContainer().isConnected &&
      map.getZoom() === before.zoom && testOperations.getPitch(map) === before.pitch &&
      map.dragging.enabled() === before.dragging && !control._walk.meshes;
    control.addTo(map);
    await globals.sceneByLayer.get(control._walk.layer)._added.promise;
    control.getContainer().querySelector('button').click();
    const restarted = control.getContainer().querySelector('button').getAttribute('aria-pressed') === 'true';
    control.remove();
    return { standalone, trafficTime, timeRemoved, nested, unchecked, rechecked, adapterRemoved,
      restoredStandalone, walking, walkRemoved, restarted };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('keyboard walking moves toward a wall, stops at it and can move away', { timeout: 30000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.evaluate(async () => {
    const map = test3d.map;
    testOperations.setBearing(map, 0);
    const wall = new L.Layer({ source: { type: '3d' } }).addTo(map);
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
  await this.page.keyboard.press('Escape');
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  assert.deepEqual(errors, [], 'Keyboard movement must not throw during collision checks');
});

Then('the walk layer moves the pedestrian on Pont d\'Iéna, stops it at walls and Esc restores the map', { timeout: 90000 }, async function () {
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
  await this.page.waitForTimeout(1500);
  await this.page.keyboard.up('KeyW');
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
  assert.ok(Math.abs(looked.lat - walked.lat) < 1e-9 && Math.abs(looked.lng - walked.lng) < 1e-9, 'Dragging does not move the walker');

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

  // Champ de Mars side street: running south ends against a building facade (after sliding along it).
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
  let previous, stuck;
  for (let i = 0; i < 100 && !stuck; i++) {
    await this.page.waitForTimeout(300);
    const { lat, lng } = await state();
    stuck = previous && Math.hypot(lat - previous.lat, lng - previous.lng) < 1e-7;
    previous = { lat, lng };
  }
  await this.page.keyboard.up('KeyW');
  const south = (48.8560 - previous.lat) * 111320;
  assert.ok(stuck, 'A building stops the walker');
  assert.ok(south > 40 && south < 120, `Stopped ${south} m south, at the facade`);

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
