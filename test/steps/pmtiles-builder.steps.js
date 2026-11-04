import assert from 'node:assert/strict';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdtemp, open, readFile, rename, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { gunzipSync, gzipSync } from 'node:zlib';
import { After, Given, Then, When } from '@cucumber/cucumber';

// build/pmtiles.js is a script, not a module: the scenarios slice out the functions they exercise.
const source = await readFile(new URL('../../build/pmtiles.js', import.meta.url), 'utf8');
const slice = (from, to) => source.slice(source.indexOf(from), source.indexOf(to));
const indexPointTiles = new Function(`${slice('function indexPointTiles(', '// Building queries')}; return indexPointTiles;`)();
const configuration = cli => new Function('parseArgs', 'buildTerrainTile',
  `${slice('const { values: args }', 'const outDir =')}
   ${slice('const ignUrl =', 'function indexPointTiles(')}
   ${slice('function indexPointTiles(', 'async function getTerrainSourceTile(')}
   return { archives, tileBounds, tilesIn, jobs };`)(options => parseArgs({ ...options, args: cli }), () => {});
const downloader = fetch => new Function('fetch', 'sleep',
  `${slice('async function download(', '// PMTiles v3 Hilbert')}; return download;`)(fetch, async () => {});
const builder = outDir => new Function('outDir', 'tilesIn', 'open', 'stat', 'gzipSync', 'createWriteStream',
  'createReadStream', 'pipeline', 'rename', 'rm', 'fileURLToPath', 'console',
  `${slice('function tileId(', 'async function build(')}\n${slice('async function build(', 'await mkdir(outDir')}\nreturn build;`)(
  outDir, () => [[1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]], open, stat, gzipSync,
  createWriteStream, createReadStream, pipeline, rename, rm, fileURLToPath, { log() {} });
const archiveBuilder = (jobs, archives, build) => new Function('jobs', 'archives', 'build',
  `${slice('async function buildArchives(', 'await mkdir(outDir')}\nreturn buildArchives;`)(jobs, archives, build);

const point = (coordinates, properties) => ({ type: 'Feature', geometry: { type: 'Point', coordinates }, properties });

Given('two trees on either side of a zoom 16 tile boundary', function () {
  const tree = (id, coordinates) => point(coordinates, { idbase: id, hauteurenm: 20, circonferenceencm: 185, genre: 'Platanus' });
  this.data = { type: 'FeatureCollection', features: [tree(1, [0, 0]), tree(2, [-0.001, 0])] };
});

When('the trees are indexed into zoom 16 tiles', function () {
  this.tiles = indexPointTiles(this.data, 16, [-1, -1, 1, 1]);
});

Then('each tree is in exactly one tile with its id and properties', function () {
  const [east, west] = this.data.features;
  assert.equal(this.tiles.size, 2);
  assert.deepEqual(this.tiles.get('32768/32768'), [east]);
  assert.deepEqual(this.tiles.get('32767/32768'), [west]);
  assert.equal(east.id, 1);
  assert.equal(east.properties.circonferenceencm, 185);
});

Then('indexing fails for invalid GeoJSON and invalid coordinates', function () {
  const [tree] = this.data.features;
  assert.throws(() => indexPointTiles({}, 16, [-1, -1, 1, 1]), /Invalid tree GeoJSON/);
  assert.throws(() => indexPointTiles({ ...this.data, features: [{ ...tree, geometry: { type: 'Point', coordinates: [NaN, 0] } }] },
    16, [-1, -1, 1, 1]), /Invalid tree coordinates/);
});

Then('points outside the archive are excluded while boundary points are kept', function () {
  const bbox = [-1, -1, 1, 1];
  const coordinates = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-1.01, 0], [1.01, 0], [0, -1.01], [0, 1.01]];
  const data = { type: 'FeatureCollection', features: coordinates.map((position, idbase) => point(position, { idbase, foyer: idbase })) };
  for (const [id, label] of [['idbase', 'tree'], ['foyer', 'streetlight']]) {
    const points = [...indexPointTiles(data, 16, bbox, id, label).values()].flat();
    assert.deepEqual(points.map(feature => feature.id).sort(), [0, 1, 2, 3, 4]);
    assert.equal(indexPointTiles(data, 16, [2, 2, 3, 3], id, label).size, 0);
  }
});

Then('all archives and building queries use the same default or custom bbox', function () {
  for (const cli of [[], ['--bbox=0,-1,1,0', '--only=trees']]) {
    const { archives, tileBounds, tilesIn } = configuration(cli);
    const bbox = cli.length ? [0, -1, 1, 0] : [2.26, 48.835, 2.38, 48.885];
    assert.deepEqual(Object.keys(archives).sort(),
      ['buildings', 'orthophotos', 'plan-ign', 'streetlights', 'terrain', 'trees']);
    for (const archive of Object.values(archives)) assert.deepEqual(archive.bbox, bbox);
    if (cli.length) {
      assert.deepEqual(tilesIn(bbox, 2, 2), [[2, 2, 2]]);
      assert.deepEqual(tileBounds(2, 2, 2), bbox);
    } else {
      assert.equal(tilesIn(bbox, archives['plan-ign'].minZoom, archives['plan-ign'].maxZoom).length, 1801);
      assert.ok(bbox[0] < 2.29449985 && bbox[2] > 2.29449985 && bbox[1] < 48.8582601 && bbox[3] > 48.8582601);
    }
  }
  for (const bbox of ['0,0,0,1', '1,0,0,1', '0,1,1,0', '0,0,Infinity,1', '0,0,181,1', '0,-86,1,0', '0,,1,1', '0,0,1']) {
    assert.throws(() => configuration([`--bbox=${bbox}`]), /Invalid --bbox/);
  }
});

Then('archive builds respect the job limit and reject invalid selections before starting', async function () {
  assert.equal(configuration([]).jobs, 3);
  for (const value of ['0', '-1', '1.5', '', 'Infinity', 'NaN', '9007199254740992']) {
    assert.throws(() => configuration([`--jobs=${value}`]), /Invalid --jobs/);
  }
  const archives = { first: {}, second: {}, third: {}, fourth: {} };
  for (const jobs of [1, 2, 6]) {
    assert.equal(configuration([`--jobs=${jobs}`]).jobs, jobs);
    let active = 0, peak = 0;
    const started = [], completed = [], pending = [];
    const run = archiveBuilder(jobs, archives, async (name, archive) => {
      assert.equal(archive, archives[name]);
      started.push(name);
      peak = Math.max(peak, ++active);
      await new Promise(resolve => pending.push(resolve));
      active--;
      completed.push(name);
    });
    const result = run([...Object.keys(archives), 'first']);
    assert.equal(active, Math.min(jobs, 4));
    while (pending.length) {
      pending.shift()();
      await new Promise(resolve => setImmediate(resolve));
    }
    await result;
    assert.equal(peak, Math.min(jobs, 4));
    assert.deepEqual(started, Object.keys(archives));
    assert.deepEqual(completed, Object.keys(archives));
    for (const name of ['missing', 'toString', '']) {
      await assert.rejects(run(['first', name]), /Unknown archive/);
      assert.equal(started.length, 4);
    }
  }
});

Then('a failed archive stops new jobs and waits for running builds', async function () {
  const failure = new Error('fixture download failed');
  const started = [];
  let release, finished = false, settled = false;
  const run = archiveBuilder(2, { first: {}, second: {}, third: {} }, async name => {
    started.push(name);
    if (name === 'first') throw failure;
    await new Promise(resolve => { release = resolve; });
    finished = true;
  });
  const result = run(['first', 'second', 'third']);
  const checked = assert.rejects(result, error => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(error.errors, [failure]);
    assert.equal(finished, true);
    return true;
  });
  result.then(() => { settled = true; }, () => { settled = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  release();
  await checked;
  assert.deepEqual(started, ['first', 'second']);
});

Given('two streetlights at the same position', function () {
  const lamp = foyer => point([2.29, 48.85], { foyer, cod_ouvrag: 'shared', support_hauteur: '7.0',
    lampe_flux: '13165.0', lampe_temperature_couleur: '2700.0' });
  this.data = { type: 'FeatureCollection', features: [lamp('one'), lamp('two')] };
});

When('the streetlights are indexed into zoom 16 tiles', function () {
  this.points = [...indexPointTiles(this.data, 16, [2.2, 48.7, 2.5, 49], 'foyer', 'streetlight').values()].flat();
});

Then('both lamps are kept with their ids and photometric records', function () {
  assert.deepEqual(this.points.map(p => p.id), ['one', 'two']);
  assert.equal(this.points[0].properties.lampe_flux, '13165.0');
  assert.equal(this.points[0].properties.lampe_temperature_couleur, '2700.0');
});

Then('a download answered with HTTP {int} fails with {string} after {int} attempts', async function (status, error, attempts) {
  let requests = 0;
  const download = downloader(async () => {
    requests++;
    return { ok: status === 200, status, arrayBuffer: async () => new ArrayBuffer(0) };
  });
  await assert.rejects(download('fixture'), new RegExp(error));
  assert.equal(requests, attempts);
});

Then('a download answered with HTTP {int} once then 200 returns the tile after {int} attempts', async function (status, attempts) {
  let requests = 0;
  const download = downloader(async () => {
    requests++;
    return { ok: requests > 1, status: requests > 1 ? 200 : status, arrayBuffer: async () => new Uint8Array([1, 2]).buffer };
  });
  assert.deepEqual(await download('fixture'), Buffer.from([1, 2]));
  assert.equal(requests, attempts);
});

const emptyTile = async () => gzipSync('{"type":"FeatureCollection","features":[]}');
const archive = { bbox: [-180, -85, 180, 85], minZoom: 1, maxZoom: 1, concurrency: 2,
  attribution: 'fixture', tileType: 0, tileCompression: 2, tile: emptyTile };

Given('a 4-tile archive has been built', async function () {
  this.directory = await mkdtemp(join(tmpdir(), 'leaflet-pmtiles-builder-'));
  this.build = builder(pathToFileURL(`${this.directory}${sep}`));
  await archiveBuilder(2, { fixture: archive, parallel: archive }, this.build)(['fixture', 'parallel']);
  this.archive = await readFile(join(this.directory, 'paris-fixture.pmtiles'));
  const parallel = await readFile(join(this.directory, 'paris-parallel.pmtiles'));
  assert.equal(parallel.readBigUInt64LE(72), 4n);
  assert.equal(parallel.length, Number(parallel.readBigUInt64LE(56) + parallel.readBigUInt64LE(64)));
});

After({ tags: '@unit' }, async function () {
  if (this.directory) await rm(this.directory, { recursive: true, force: true });
});

Then('its directory lists Hilbert tiles 1 to 4 with their data', function () {
  const file = this.archive, int = offset => Number(file.readBigUInt64LE(offset));
  assert.equal(int(72), 4);
  assert.deepEqual([102, 106, 110, 114].map(offset => file.readInt32LE(offset) / 1e7), archive.bbox);
  const root = gunzipSync(file.subarray(127, 127 + int(16)));
  let cursor = 0;
  const varint = () => {
    let value = 0, shift = 0, byte;
    do {
      byte = root[cursor++];
      value += (byte & 127) * 2 ** shift;
      shift += 7;
    } while (byte & 128);
    return value;
  };
  const count = varint(), ids = [];
  assert.equal(count, 4);
  for (let i = 0, id = 0; i < count; i++) ids.push(id += varint());
  assert.deepEqual(ids, [1, 2, 3, 4], 'Exact Hilbert coverage, not just the tile count');
  const runs = Array.from({ length: count }, varint), lengths = Array.from({ length: count }, varint), offsets = [];
  for (let i = 0; i < count; i++) {
    const encoded = varint();
    offsets.push(encoded ? encoded - 1 : offsets[i - 1] + lengths[i - 1]);
  }
  assert.deepEqual(runs, [1, 1, 1, 1]);
  const dataStart = int(56);
  for (let i = 0; i < count; i++) {
    const tile = file.subarray(dataStart + offsets[i], dataStart + offsets[i] + lengths[i]);
    assert.deepEqual(JSON.parse(gunzipSync(tile)), { type: 'FeatureCollection', features: [] });
  }
  assert.equal(file.length, dataStart + int(64));
});

const failedBuilds = {
  'missing a tile': async (z, x, y) => x === 1 && y === 0 ? null : emptyTile(),
  'with failing downloads': async () => { throw new Error('HTTP 404'); },
};

Then(/^a build (missing a tile|with failing downloads) is not published and keeps the previous archive$/, async function (failure) {
  await assert.rejects(this.build('fixture', { ...archive, tile: failedBuilds[failure] }), /archive incomplete; not published/);
  assert.deepEqual(await readFile(join(this.directory, 'paris-fixture.pmtiles')), this.archive);
});
