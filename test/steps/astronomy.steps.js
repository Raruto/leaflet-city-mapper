import assert from 'node:assert/strict';
import { Then, When } from '@cucumber/cucumber';
import { atmosphere } from '../../src/sunlight/atmosphere.js';
import { moonPosition } from '../../src/sunlight/moonPosition.js';
import { solarPosition } from '../../src/sunlight/solarPosition.js';
import { solarTime } from '../../src/sunlight/solarTime.js';

const eiffel = [48.858, 2.2945];
const unit = direction => Math.abs(Math.hypot(...direction) - 1) < 1e-12;

Then('celestial date normalization preserves native dates and independent results', function () {
  const instant = new Date('2026-06-21T12:00:00Z');
  for (const input of [instant, instant.toISOString(), instant.getTime(), null, true, 1.9,
    { valueOf: () => instant.getTime() }]) {
    const expected = new Date(input).getTime();
    assert.equal(solarTime(input, ...eiffel), expected);
    for (const compute of [solarPosition, moonPosition]) {
      assert.deepEqual(compute(input, ...eiffel), compute(new Date(expected), ...eiffel));
    }
  }
  const savedTime = instant.getTime();
  for (const compute of [solarPosition, moonPosition]) {
    const first = compute(instant, ...eiffel);
    const saved = structuredClone(first);
    const second = compute(instant, ...eiffel);
    assert.notEqual(first, second);
    assert.notEqual(first.direction, second.direction);
    second.direction[0] = 99;
    compute('2026-12-21T00:00:00Z', -48, 2);
    assert.deepEqual(first, saved);
    for (const invalidDate of ['', 'invalid', NaN, Infinity, 8640000000000001, new Date(NaN)]) {
      assert.throws(() => compute(invalidDate, ...eiffel), /Invalid solar date or location/);
    }
    for (const [lat, lng] of [[91, 2], [-91, 2], [48, 181], [48, -181], [NaN, 2], [48, Infinity]]) {
      assert.throws(() => compute(instant, lat, lng), /Invalid solar date or location/);
    }
  }
  assert.equal(instant.getTime(), savedTime);
  instant.getTime = () => { throw new Error('Date overrides must not change native normalization'); };
  assert.equal(solarTime(instant, ...eiffel), savedTime);
  for (const input of ['2026-06-21', '2026-06-21T14:00:00+02:00', '0', '']) {
    const expected = new Date(input).getTime();
    if (Number.isFinite(expected)) assert.equal(solarTime(input, ...eiffel), expected);
    else assert.throws(() => solarTime(input, ...eiffel), /Invalid solar date or location/);
  }
  const NativeDate = globalThis.Date;
  try {
    globalThis.Date = new Proxy(NativeDate, {
      construct() { throw new Error('String normalization must not construct Date'); },
    });
    assert.equal(solarTime('2026-06-21T12:00:00Z', ...eiffel), savedTime);
  } finally {
    globalThis.Date = NativeDate;
  }
});

When('the sun is computed for {string} at the Eiffel Tower', function (time) {
  this.body = solarPosition(time, ...eiffel);
});

When('the moon is computed for {string} at the Eiffel Tower', function (time) {
  this.time = time;
  this.body = moonPosition(time, ...eiffel);
});

Then('its altitude is between {int} and {int} degrees', function (low, high) {
  assert.ok(this.body.altitude > low && this.body.altitude < high, String(this.body.altitude));
});

Then('its azimuth is between {int} and {int} degrees', function (low, high) {
  assert.ok(this.body.azimuth > low && this.body.azimuth < high, String(this.body.azimuth));
});

Then('its direction is a unit vector', function () {
  assert.ok(unit(this.body.direction));
});

Then('the same instant written as {string} gives the same sun', function (time) {
  assert.deepEqual(solarPosition(new Date(time), ...eiffel), this.body);
});

Then('its direction points east at {string} and west at {string}', function (morning, evening) {
  assert.ok(solarPosition(morning, ...eiffel).direction[0] > 0);
  assert.ok(solarPosition(evening, ...eiffel).direction[0] < 0);
});

Then('it is opposite the sun', function () {
  const sun = solarPosition(this.time, ...eiffel).direction;
  assert.ok(this.body.direction.reduce((sum, value, i) => sum + value * sun[i], 0) < -0.99);
});

Then('it changes one hour later and in the southern hemisphere', function () {
  const later = new Date(Date.parse(this.time) + 3600000);
  assert.notDeepEqual(moonPosition(later, ...eiffel), this.body);
  assert.notDeepEqual(moonPosition(this.time, -eiffel[0], eiffel[1]), this.body);
});

Then('daylight has a neutral tint', function () {
  assert.deepEqual(atmosphere(65).tint, [1, 1, 1]);
});

Then('the tint stays constant below -18 and above 25 degrees', function () {
  assert.deepEqual(atmosphere(-90), atmosphere(-18));
  assert.deepEqual(atmosphere(90), atmosphere(25));
});

Then('night is blue while sunset is red', function () {
  const night = atmosphere(-18), sunset = atmosphere(0);
  assert.ok(night.tint[2] > night.tint[0]);
  assert.ok(sunset.tint[0] > sunset.tint[2]);
  assert.notEqual(night.background, sunset.background);
});

Then('the tint is continuous around -18, -6, 0, 10 and 25 degrees', function () {
  for (const altitude of [-18, -6, 0, 10, 25]) {
    const before = atmosphere(altitude - 0.001), after = atmosphere(altitude + 0.001);
    assert.ok(before.tint.every((value, i) => Math.abs(value - after.tint[i]) < 0.001), String(altitude));
  }
});

const invalid = {
  'the sun with an empty date': () => solarPosition('', 48, 2),
  'the sun with latitude 91': () => solarPosition(new Date(), 91, 2),
  'the moon with "invalid" date': () => moonPosition('invalid', 48, 2),
  'the atmosphere with NaN altitude': () => atmosphere(NaN),
};

Then(/^computing (.+) fails with "(.+)"$/, function (input, error) {
  assert.throws(invalid[input], new RegExp(error));
});
