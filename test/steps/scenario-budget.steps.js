import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { Then } from '@cucumber/cucumber';
import { scenarioTimeout, withScenarioBudget } from '../support/scenario-budget.js';
import { focusParisLayers } from '../fixtures/focused-paris.js';

Then('scenario steps share one deadline without preventing cleanup', async function () {
  assert.equal(scenarioTimeout, 30000);
  const world = { scenarioStarted: performance.now() - scenarioTimeout - 1 };
  let called = false;
  const action = () => { called = true; return 42; };
  await assert.rejects(withScenarioBudget(action).call(world), /30-second budget/);
  world.scenarioStarted = performance.now();
  await assert.rejects(withScenarioBudget(function () {
    this.scenarioStarted -= scenarioTimeout + 1;
  }).call(world), /30-second budget/, 'Synchronous work must not silently exceed the budget');
  assert.equal(called, false);
  assert.equal(await withScenarioBudget(action, { cleanup: true }).call(world), 42);
  assert.equal(await withScenarioBudget(action).call({}), 42, 'Global setup has its own timeout');
  world.scenarioStarted = performance.now();
  assert.equal(await withScenarioBudget(action).call(world), 42);
  world.scenarioStarted = performance.now() - scenarioTimeout + 20;
  await assert.rejects(withScenarioBudget(() => new Promise(() => {})).call(world), /30-second budget/);
  await assert.rejects(withScenarioBudget(action).call(world), /30-second budget/);
});

Then('focused Paris fixtures keep real selected layers and preserve control labels', async function () {
  const source = await readFile(new URL('../../examples/leaflet-city-mapper.html', import.meta.url), 'utf8');
  assert.equal(focusParisLayers(source, ['Empty', 'Plan IGN', 'Orthophoto IGN', 'Terrain (3D)',
    'Buildings', 'Trees', 'Eiffel Tower', 'Streetlights', 'Traffic', 'Time']), source);
  const focused = focusParisLayers(source, ['Trees', 'Time']);
  assert.match(focused, /paris-trees\.pmtiles/);
  assert.match(focused, /new L\.Control\.Time/);
  assert.doesNotMatch(focused, /paris-(buildings|streetlights|orthophotos)\.pmtiles/);
  for (const name of ['Buildings', 'Streetlights', 'Eiffel Tower', 'Traffic', 'Orthophoto IGN']) {
    assert.ok(focused.includes(`'${name}': new L.LayerGroup(),`), name);
  }
});

Then('test steps and browser waits declare no timeout above thirty seconds', async function () {
  const directory = new URL('./', import.meta.url);
  const violations = [];
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.js')) continue;
    const source = await readFile(new URL(name, directory), 'utf8');
    for (const match of source.matchAll(/timeout:\s*(\d+)/g)) {
      if (Number(match[1]) > scenarioTimeout) violations.push(`${name}: ${match[1]}ms`);
    }
  }
  assert.deepEqual(violations, [], 'Split long checks instead of increasing their timeout');
});
