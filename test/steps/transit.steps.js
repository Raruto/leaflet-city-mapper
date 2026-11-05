import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { transitLanes, transitSettings } from '../../examples/data/paris-traffic.js';

import { build } from '../../src/geometry/build.js';
import { tripsAt } from '../../src/traffic/tripsAt.js';
import { routeGeometry } from '../../src/traffic/routeGeometry.js';

Then('transit route dashes follow line colours and sloping terrain', function () {
  const lane = { points: [[0, 0, 10], [60, 0, 40]], lengths: [0, 60], properties: { route_color: 'FF0000' } };
  const geometry = routeGeometry([lane]);
  assert.equal(geometry.position.length, 36, 'Two 18-metre dashes separated by 12-metre gaps');
  for (let i = 0; i < geometry.position.length; i += 3) {
    const [x, y] = geometry.position.slice(i, i + 3);
    assert.ok(x <= 18 || x >= 30 && x <= 48, 'Keep gaps between dashes');
    assert.ok(Math.abs(y - (10 + x / 2 + 0.4)) < 1e-10);
    assert.deepEqual(geometry.color.slice(i, i + 3), [1, 0, 0]);
  }
  delete lane.properties;
  assert.deepEqual(routeGeometry([lane]).color.slice(0, 3), [0.08, 0.7, 0.85]);
});

Then('Paris transit routes produce moving bus, tram and metro simulations', function () {
  const bounds = [2.26, 48.835, 2.38, 48.885];
  const data = {
    type: 'FeatureCollection',
    features: [
      ['Bus', 'bus'],
      ['Tram', 'tram'],
      ['Subway', 'metro'],
    ].map(([route_type, route_id]) => ({
      type: 'Feature',
      properties: { route_id, route_type, route_short_name: '1', route_color: 'FF0000' },
      geometry: { type: 'LineString', coordinates: [[2.29, 48.85], [2.30, 48.86]] },
    })),
  };
  const before = JSON.stringify(data);
  for (const mode of ['bus', 'tram', 'metro']) {
    const settings = transitSettings(mode);
    const lanes = transitLanes(data, mode, bounds);
    assert.ok(lanes.features.length > 0, mode);
    let active = 0;
    for (const feature of lanes.features) {
      assert.equal(feature.properties.route_type, settings.type);
      assert.equal(feature.properties.flow, settings.flow);
      assert.match(feature.properties.description, /not live/);
      for (const [lng, lat] of feature.geometry.coordinates) {
        assert.ok(lng >= bounds[0] - 1e-10 && lng <= bounds[2] + 1e-10);
        assert.ok(lat >= bounds[1] - 1e-10 && lat <= bounds[3] + 1e-10);
      }
      let length = 0;
      const points = feature.geometry.coordinates;
      for (let i = 1; i < points.length; i++) {
        const latitude = (points[i][1] + points[i - 1][1]) / 2 * Math.PI / 180;
        length += Math.hypot((points[i][0] - points[i - 1][0]) * 111195 * Math.cos(latitude),
          (points[i][1] - points[i - 1][1]) * 111195);
      }
      active += tripsAt(100000, [{ length, properties: feature.properties }], settings.speed).length;
    }
    assert.ok(active > 0, `${mode} must actually emit vehicles on the routes`);
    const model = globals.vehicles[mode].model;
    const red = build(model(0, { route_color: 'FF0000' }));
    const blue = build(model(0, { route_color: '0000FF' }));
    assert.equal(red.position.length, blue.position.length);
    assert.equal(red.position.length, build(model(0)).position.length, 'GPU template topology is fixed');
    assert.ok(red.position.every(Number.isFinite));
    assert.ok(red.normal.every(Number.isFinite));
    assert.notDeepEqual(red.color, blue.color);
    const lane = { length: 2000, properties: lanes.features[0].properties };
    const first = tripsAt(100000, [lane], settings.speed);
    const next = tripsAt(101000, [lane], settings.speed);
    assert.ok(first.length > 0);
    assert.equal(first.length, next.length);
    for (let i = 0; i < first.length; i++) {
      assert.ok(Math.abs((next[i].distance - first[i].distance + lane.length) % lane.length - settings.speed) < 1e-6);
    }
  }
  assert.equal(JSON.stringify(data), before, 'Do not mutate open-data routes');
});

Then('transit clipping preserves disjoint route parts and reports invalid data', function () {
  const feature = {
    type: 'Feature',
    properties: { route_id: 'test', route_type: 'Bus', route_short_name: '42' },
    geometry: { type: 'LineString', coordinates: [[-1, 0.5], [2, 0.5], [2, 2], [0.5, 2], [0.5, -1]] },
  };
  const data = { type: 'FeatureCollection', features: [feature, structuredClone(feature)] };
  const result = transitLanes(data, 'bus', [0, 0, 1, 1]);
  assert.equal(result.features.length, 2, 'Deduplicate exact route pieces without joining gaps');
  assert.deepEqual(result.features[0].geometry.coordinates, [[0, 0.5], [1, 0.5]]);
  assert.deepEqual(result.features[1].geometry.coordinates, [[0.5, 1], [0.5, 0]]);
  feature.geometry = { type: 'MultiLineString', coordinates: [
    [[0, 0.5], [0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [1, 0.5]],
  ] };
  const joined = transitLanes({ type: 'FeatureCollection', features: [feature] }, 'bus', [0, 0, 1, 1]);
  assert.equal(joined.features.length, 1, 'Join touching segments and ignore repeated vertices');
  assert.throws(() => transitSettings('plane'), /Unknown transit mode/);
  assert.throws(() => transitLanes({}, 'bus', [0, 0, 1, 1]), /Invalid transit GeoJSON/);
  feature.geometry = { type: 'LineString', coordinates: [[NaN, 0], [1, 1]] };
  assert.throws(() => transitLanes(data, 'bus', [0, 0, 1, 1]), /Invalid coordinates/);
});
