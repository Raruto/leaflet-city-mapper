import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { mockLeaflet } from '../fixtures/leaflet.js';
import { decodeVectorTile } from '../../src/mvt/decodeVectorTile.js';
import { triangulateVectorRings } from '../../src/mvt/triangulateVectorRings.js';
import { parseVectorStyle } from '../../src/vector-style/parseVectorStyle.js';
import { evaluateStyle } from '../../src/vector-style/evaluateStyle.js';
import { vectorPaint } from '../../src/vector-style/vectorPaint.js';
import { visibleStyle } from '../../src/vector-style/visibleStyle.js';
import { prepareVectorTile } from '../../src/vector-tiles/prepareVectorTile.js';
import { dashedSegment } from '../../src/geometry/dashedSegment.js';
import { collectVisibleMesh } from '../../src/rendering/collectVisibleMesh.js';
import { refreshNativeEvent } from '../../src/native/refreshNativeEvent.js';
import { configureVectorTileLayer } from '../../src/vector-tiles/configureVectorTileLayer.js';
import { isVectorTileSource } from '../../src/sources/isVectorTileSource.js';
import { varint, field, feature, tile } from '../fixtures/vector-tile.js';

Then('vector tile decoding, styling, geometry and source validation work', async function () {
function float(value, size) {
  const bytes = new Uint8Array(size), view = new DataView(bytes.buffer);
  if (size === 4) view.setFloat32(0, value, true);
  else view.setFloat64(0, value, true);
  return [...bytes];
}

const keys = ['name', 'float', 'double', 'signed', 'unsigned', 'zigzag', 'boolean', '__proto__'];
const values = [
  field(1, 2, [...new TextEncoder().encode('Parigi')]),
  field(2, 5, float(1.5, 4)),
  field(3, 1, float(2.25, 8)),
  field(4, 0, varint(-123)),
  field(5, 0, varint(18446744073709551615n)),
  field(6, 0, varint(13)),
  field(7, 0, varint(1)),
  field(1, 2, [...new TextEncoder().encode('safe')]),
];
const polygon = [
  9, 0, 0, 26, 20, 0, 0, 20, 19, 0, 15, // Exterior square.
  9, 4, 15, 26, 0, 12, 12, 0, 0, 11, 15, // Opposite winding: hole.
  9, 24, 3, 26, 8, 0, 0, 8, 7, 0, 15, // Second exterior.
];
const buffer = tile([
  feature(3, polygon, keys.flatMap((_, index) => [index, index]), 9007199254740993n),
  feature(2, [9, 1, 4, 10, 8, 5, 9, 10, 2, 10, 2, 2]),
  feature(1, [17, 2, 4, 4, 4]),
], keys, values);
const [layer] = decodeVectorTile(buffer);
assert.equal(layer.name, 'test');
assert.equal(layer.extent, 4096);
assert.equal(layer.features[0].id, '9007199254740993');
assert.deepEqual({ ...layer.features[0].properties }, {
  name: 'Parigi', float: 1.5, double: 2.25, signed: -123,
  unsigned: '18446744073709551615', zigzag: -7, boolean: true, ['__proto__']: 'safe',
});
assert.equal(Object.getPrototypeOf(layer.features[0].properties), null);
assert.deepEqual(layer.features[0].geometry, [
  [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
  [[2, 2], [2, 8], [8, 8], [8, 2], [2, 2]],
  [[20, 0], [24, 0], [24, 4], [20, 4], [20, 0]],
]);
assert.deepEqual(layer.features[1].geometry, [[[-1, 2], [3, -1]], [[8, 0], [9, 1]]]);
assert.deepEqual(layer.features[2].geometry, [[[1, 2], [3, 4]]]);

const padded = new Uint8Array(buffer.length + 8);
padded.set(buffer, 4);
assert.deepEqual(decodeVectorTile(padded.subarray(4, -4)), [layer]);
assert.deepEqual(decodeVectorTile(buffer.buffer), [layer]);
assert.deepEqual(decodeVectorTile(new Uint8Array()), []);
for (const invalid of [undefined, null, {}, [], 'tile']) {
  assert.throws(() => decodeVectorTile(invalid), /MVT input/);
}
const unpacked = [...field(3, 0, varint(1)), ...[9, 2, 4].flatMap(value => field(4, 0, varint(value)))];
assert.deepEqual(decodeVectorTile(tile([unpacked]))[0].features[0].geometry, [[[1, 2]]]);

for (const [type, geometry] of [
  [1, [9, 2]], [1, [0]], [1, [8]], [1, [9, 0, 0, 10, 2, 2]],
  [2, [10, 2, 2]], [2, [9, 0, 0]], [2, [15]], [2, [17, 0, 0, 2, 2]],
  [3, [9, 0, 0, 18, 2, 0, 0, 2]], [3, [9, 0, 0, 10, 2, 2, 15]],
  [3, [...polygon, 15]], [3, [9, 0, 0, 26, 2, 0, 0, 2, 1, 0, 23]],
]) {
  assert.throws(() => decodeVectorTile(tile([feature(type, geometry)])), /MVT/);
}
assert.throws(() => decodeVectorTile(tile([feature(1, [9, 0, 0], [0])])), /feature/);
assert.throws(() => decodeVectorTile(tile([feature(1, [9, 0, 0], [0, 0])])), /property index/);
assert.throws(() => decodeVectorTile(new Uint8Array([26, 255])), /Truncated/);
assert.throws(() => decodeVectorTile(new Uint8Array([26, ...Array(9).fill(255), 2])), /varint/);
assert.throws(() => decodeVectorTile(new Uint8Array([0])), /field number/);
assert.throws(() => decodeVectorTile(new Uint8Array([12])), /wire type/);
assert.throws(() => decodeVectorTile(new Uint8Array(field(3, 0, [0]))), /wire type/);
assert.throws(() => decodeVectorTile(new Uint8Array([...buffer, ...buffer])), /Duplicate/);
assert.throws(() => decodeVectorTile(tile([], ['bad'], [[...field(1, 2, [255])]])));
assert.throws(() => decodeVectorTile(tile([], [], [[]])), /Empty MVT value/);
console.log('MVT decoder: geometry, holes, properties, 64-bit integers and invalid input OK');

function triangleArea(triangles) {
  return triangles.reduce((sum, [a, b, c]) => sum +
    Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2, 0);
}
assert.equal(triangleArea(triangulateVectorRings(layer.features[0].geometry)), 80);
const square = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
const touchingHole = [[0, 0], [1, 3], [3, 1], [0, 0]];
assert.equal(triangleArea(triangulateVectorRings([square, touchingHole])), 96);
assert.equal(triangleArea(triangulateVectorRings([square.toReversed(), touchingHole.toReversed()])), 96);
assert.equal(triangleArea(triangulateVectorRings([
  [[0, 0], [8, 0], [8, 2], [2, 2], [2, 8], [0, 8], [0, 0]],
])), 28);
assert.deepEqual(triangulateVectorRings([[[0, 0], [1, 0], [2, 0], [0, 0]]]), []);
assert.throws(() => triangulateVectorRings([[[0, 0], [1, 0], [1, 1]]]), /closed rings/);
assert.throws(() => triangulateVectorRings([[[0, 0], [NaN, 0], [1, 1], [0, 0]]]), /coordinate/);
assert.equal(triangleArea(triangulateVectorRings([[[0, 0], [2, 2], [0, 2], [2, 0], [0, 0]]])), 2);
console.log('MVT tessellation: holes, touching rings, winding, concavity and invalid input OK');

const style = parseVectorStyle(`const otm_layers = [
  // Data-only declaration with both quote styles and trailing commas.
  {'id': 'roads', "type": "line", 'source': 'opentopomap-vector', 'source-layer': 'test',
   'minzoom': 16, 'maxzoom': 19,
   'filter': ['all', ['==', 'class', 'path'], ['has', 'name']],
   'paint': {'line-color': 'rgba(255,128,0,0.5)', 'line-opacity': 0.4,
     'line-width': ['interpolate', ['linear'], ['zoom'], 16, 2, 19, 8],
     'line-dasharray': [1.2, 0.8],},},
];`);
assert.equal(style.length, 1);
assert.equal(visibleStyle(style[0], { class: 'path', name: 'A' }, 17), true);
assert.equal(visibleStyle(style[0], { class: 'road', name: 'A' }, 17), false);
assert.equal(visibleStyle(style[0], { class: 'path', name: 'A' }, 19), false);
const paint = vectorPaint(style[0], {}, 17);
assert.deepEqual(paint.color, { r: 1, g: 128 / 255, b: 0 });
assert.equal(paint.opacity, 0.2);
assert.equal(paint.weight, 4);
assert.equal(paint.dashArray, '4.8 3.2');
assert.deepEqual(vectorPaint({ type: 'fill', paint: {
  'fill-color': '#abc', 'fill-opacity': 0.3,
} }, {}, 15).fillColor, { r: 170 / 255, g: 187 / 255, b: 204 / 255 });
assert.equal(evaluateStyle(['interpolate', ['linear'], ['zoom'], 0, '#000', 2, '#fff'], {}, 1),
  'rgba(128,128,128,1)');
assert.equal(evaluateStyle(['match', ['get', 'class'], ['path', 'track'], 2, 1], { class: 'track' }, 15), 2);
assert.equal(evaluateStyle(['step', ['zoom'], 1, 16, 2, 18, 4], {}, 17), 2);
assert.equal(evaluateStyle(['case', ['has', 'name'], ['get', 'name'], 'unknown'], { name: 'A' }, 15), 'A');
assert.throws(() => evaluateStyle(['unsupported'], {}, 15), /Unsupported/);
assert.throws(() => vectorPaint({ type: 'line', paint: { 'line-color': 'not-a-color' } }, {}, 15), /color/);
assert.throws(() => parseVectorStyle('const otm_layers = []; globalThis.executed = true;'));
assert.throws(() => parseVectorStyle('[/* unterminated'), /Unterminated/);
assert.throws(() => parseVectorStyle('[{}]'), /Invalid/);
assert.equal(parseVectorStyle(`[{'id':'quote', 'type':'symbol', 'text': 'it\\'s "safe" // /*',},]`)[0].text,
  `it's "safe" // /*`);

const workerStyle = [{ ...style[0], filter: undefined }];
const prepared = prepareVectorTile(tile([feature(2, [9, 0, 0, 10, 20, 20])]),
  { x: 8296, y: 5636, z: 14 }, workerStyle, 15);
assert.equal(prepared.batches.length, 1, 'Prepare geometry that becomes visible during cached overzoom');
assert.equal(prepared.batches[0].paths[0].length, 2);
assert.equal(prepareVectorTile(tile([feature(2, [9, 0, 0, 10, 20, 20])]),
  { x: 8296, y: 5636, z: 14 }, workerStyle, 15, 'other-source').batches.length, 0);
assert.ok(prepared.batches[0].paths[0].flat().every(Number.isFinite));
const invisible = prepareVectorTile(tile([feature(2, [9, 0, 0, 10, 20, 20])]),
  { x: 8296, y: 5636, z: 14 }, [{ ...workerStyle[0], paint: { 'line-width': 0 } }], 15);
assert.equal(invisible.batches.length, 0, 'Do not retain strokes that are invisible at every supported zoom');
const labels = prepareVectorTile(tile([feature(1, [9, 4096, 4096], [0, 0])], ['name'],
  [field(1, 2, [...new TextEncoder().encode('Paris')])]),
{ x: 8296, y: 5636, z: 14 }, [{
  id: 'places', type: 'symbol', source: 'opentopomap-vector', 'source-layer': 'test',
  minzoom: 16, maxzoom: 18, layout: { 'text-field': '{name}' },
}], 15);
assert.equal(labels.labels[0].text, 'Paris', 'Retain labels visible between preparation and maximum zoom');
assert.equal(prepareVectorTile(tile([feature(1, [9, 4096, 4096], [0, 0])], ['name'],
  [field(1, 2, [...new TextEncoder().encode('Paris')])]),
{ x: 8296, y: 5636, z: 14 }, [{
  id: 'places', type: 'symbol', source: 'another-provider', 'source-layer': 'test',
  minzoom: 20, layout: { 'text-field': '{name}' },
}], 15, 'another-provider', 21).labels[0].text, 'Paris');
assert.deepEqual(parseVectorStyle('{"version":8,"layers":[{"id":"water","type":"fill"}]}'),
  [{ id: 'water', type: 'fill' }]);
console.log('OpenTopoMap style: safe parsing, expressions, numeric colors and worker preparation OK');

class Point {
  constructor(x, y) { this.x = x; this.y = y; }
  add(p) { return new Point(this.x + p.x, this.y + p.y); }
  subtract(p) { return new Point(this.x - p.x, this.y - p.y); }
  multiplyBy(n) { return new Point(this.x * n, this.y * n); }
  divideBy(n) { return this.multiplyBy(1 / n); }
  distanceTo(p) { return Math.hypot(this.x - p.x, this.y - p.y); }
}
class Polyline {
  constructor(options) { this.options = options; }
}
class Polygon extends Polyline {}
const previousLeaflet = mockLeaflet({ Point, Polyline, Polygon });
try {
  for (const options of [{ stroke: false, weight: 3 }, { stroke: true, weight: 0 }]) {
    const state = { source: new Polyline(options), dirty: false };
    refreshNativeEvent.call(state, { type: 'zoomend' });
    assert.equal(state.dirty, false, 'Invisible strokes do not rebuild geometry on zoom');
  }
  for (const [dash, distance, length] of [
    [[2, 1], 1, 10], [[1.2, 2.4], 192, 12345],
    [[0, 1], 0, 5], [[1, 0], 0, 5], [[0.1, 0.2, 0, 0.3], -0.4, 100],
  ]) {
    const context = { dash, width: 1, options: { lineCap: 'butt' }, stroke: [],
      point: p => [p.x, p.y, 0] };
    dashedSegment(context, new Point(0, 0), new Point(length, 0), length, distance,
      dash.reduce((sum, value) => sum + value, 0));
    assert.ok(context.stroke.every(Number.isFinite));
    if (dash[0] === 2) {
      const ranges = [];
      for (let i = 0; i < context.stroke.length; i += 18) {
        const x = context.stroke.slice(i, i + 18).filter((_, index) => index % 3 === 0);
        ranges.push([Math.min(...x), Math.max(...x)]);
      }
      assert.deepEqual(ranges, [[0, 1], [2, 4], [5, 7], [8, 10]]);
    }
    if (dash[0] === 0) assert.equal(context.stroke.length, 0);
  }
} finally { mockLeaflet(previousLeaflet); }
console.log('Native dashes: fractional widths, zero entries, negative offsets and continuous phase OK');

const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const mesh = { geometry: { bounds: { center: [0, 0, 0], radius: 1 }, nativeStrokeRadius: 1 },
  worldMatrix: identity, _worldMatrixVersion: 1, program: { uniforms: { strokeScale: { value: 1 } } } };
const frustum = [[1, 0, 0, -3], ...Array.from({ length: 5 }, () => [0, 0, 0, 1])];
const candidates = [], lengths = [1, 0, 0, 0, 0, 0];
collectVisibleMesh(mesh, identity, frustum, lengths, candidates);
assert.equal(candidates.length, 0);
mesh.program.uniforms.strokeScale.value = 4;
collectVisibleMesh(mesh, identity, frustum, lengths, candidates);
assert.equal(candidates.length, 1, 'GPU-expanded strokes stay visible at viewport edges');
console.log('Native stroke culling: cached bounds account for GPU-expanded widths OK');

await assert.rejects(configureVectorTileLayer({}), /source options/);
await assert.rejects(configureVectorTileLayer({}, { url: 'invalid', style: [] }), /XYZ/);
await assert.rejects(configureVectorTileLayer({}, { url: 'https://example.test/{z}/{x}/{y}.pbf', style: [],
  minNativeZoom: 15, maxNativeZoom: 14 }), /zoom range/);
await assert.rejects(configureVectorTileLayer({}, { url: 'https://example.test/{z}/{x}/{y}.pbf', style: [{}] }), /style layers/);
assert.equal(isVectorTileSource({ url: 'https://example.test/{z}/{x}/{y}.pbf' }), true);
assert.equal(isVectorTileSource({ tileJSON: 'https://example.test/tiles.json' }), true);
assert.equal(isVectorTileSource({ data: {}, url: 'https://example.test/{z}/{x}/{y}.pbf' }), false);
for (const url of ['data.geojson', 'model.glb', 'buildings.pmtiles', 'data.json']) {
  assert.equal(isVectorTileSource({ url }), false);
}
console.log('Vector tile API: invalid options, templates, zoom limits and styles reject explicitly OK');
});
