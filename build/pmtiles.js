// Builds the offline PMTiles archives used by examples/leaflet-city-mapper.html.
// Usage: node build/pmtiles.js [--bbox=west,south,east,north] [--minzoom=11] [--maxzoom=17] [--only=buildings,trees,streetlights,orthophotos,plan-ign,terrain] [--jobs=3]
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, open, rename, rm, stat, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { gzipSync, gunzipSync, inflateSync, deflateSync } from 'node:zlib';
import { join, resolve, sep } from 'node:path';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { readCogDirectory } from '../src/cog/readCogDirectory.js';
import { decodeHeader } from '../src/archives/decodeHeader.js';
import { decodeDirectory } from '../src/archives/decodeDirectory.js';

const { values: args } = parseArgs({
  options: {
    bbox: { type: 'string' },
    minzoom: { type: 'string', default: '11' },
    maxzoom: { type: 'string', default: '17' },
    only: { type: 'string', default: 'buildings,trees,streetlights,orthophotos,plan-ign,terrain' },
    jobs: { type: 'string', default: '3' },
    center: { type: 'string', default: '12.49223,41.89021' },
    side: { type: 'string', default: '2048' },
    'imagery-zoom': { type: 'string', default: '17' },
    'overview-min-zoom': { type: 'string', default: '14' },
    'elevation-zoom': { type: 'string', default: '14' },
    'out-dir': { type: 'string' },
    'self-test': { type: 'boolean' },
    help: { type: 'boolean' },
  },
});
const buildingsBbox = (args.bbox || '2.26,48.835,2.38,48.885').split(',').map(value => value.trim() ? Number(value) : NaN);
const minZoom = Number(args.minzoom);
const maxZoom = Number(args.maxzoom);
const jobs = Number(args.jobs);
if (!Number.isSafeInteger(jobs) || jobs < 1) throw new Error('Invalid --jobs: expected a positive integer');
if (buildingsBbox.length !== 4 || !buildingsBbox.every(Number.isFinite) ||
  !(buildingsBbox[0] >= -180 && buildingsBbox[0] < buildingsBbox[2] && buildingsBbox[2] <= 180 &&
    buildingsBbox[1] >= -85.0511287798066 && buildingsBbox[1] < buildingsBbox[3] && buildingsBbox[3] <= 85.0511287798066) ||
  !Number.isInteger(minZoom) || !Number.isInteger(maxZoom) || !(minZoom >= 0 && minZoom <= maxZoom && maxZoom <= 19)) {
  throw new Error('Invalid --bbox, --minzoom, or --maxzoom');
}
const outDir = args['out-dir'] ? pathToFileURL(resolve(args['out-dir']) + sep) : new URL('../examples/data/', import.meta.url);
const ignUrl = (layer, format) => (z, x, y) => `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&FORMAT=${format}&TILEMATRIXSET=PM_0_19&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`;
const ignAttribution = 'IGN — Licence Ouverte Etalab 2.0';
const terrainZoom = 14;
const terrainSourceTiles = new Map();
let treeTiles;
let lightTiles;

const archives = {
  streetlights: {
    tileType: 0,
    tileCompression: 2,
    bbox: buildingsBbox,
    minZoom: 16,
    maxZoom: 16,
    concurrency: 2,
    attribution: 'Ville de Paris / Cielis — ODbL',
    metadata: { source: 'https://opendata.paris.fr/explore/dataset/eclairage-public/', format: 'geojson' },
    async tile(z, x, y) {
      lightTiles ||= (async () => {
        const base = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/eclairage-public';
        const metadata = JSON.parse(await download(base));
        const url = new URL(`${base}/exports/geojson`);
        url.searchParams.set('select', 'geo_point_2d,foyer,cod_ouvrag,lib_domain,lib_ouvrag,lib_regime,support_hauteur,lampe_puissance,lampe_flux,lampe_famille,lampe_temperature_couleur,voie_libelle,date_maj');
        const data = JSON.parse(await download(url));
        Object.assign(archives.streetlights.metadata, {
          sourceUpdatedAt: metadata.metas.default.modified, retrievedAt: new Date().toISOString(),
          records: data.features?.length,
        });
        return indexPointTiles(data, z, archives.streetlights.bbox, 'foyer', 'streetlight');
      })();
      const tiles = await lightTiles;
      return gzipSync(JSON.stringify({ type: 'FeatureCollection', features: tiles.get(`${x}/${y}`) || [] }));
    },
  },
  trees: {
    tileType: 0,
    tileCompression: 2,
    bbox: buildingsBbox,
    minZoom: 16,
    maxZoom: 16,
    concurrency: 2,
    attribution: 'Ville de Paris — ODbL',
    metadata: { source: 'https://opendata.paris.fr/explore/dataset/les-arbres/', format: 'geojson' },
    async tile(z, x, y) {
      // One export avoids hundreds of API requests and assigns boundary points exactly once.
      treeTiles ||= (async () => {
        const url = new URL('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/les-arbres/exports/geojson');
        url.searchParams.set('select', 'geo_point_2d,idbase,typeemplacement,hauteurenm,circonferenceencm,genre,espece,libellefrancais,stadedeveloppement,remarquable');
        return indexPointTiles(JSON.parse(await download(url)), z, archives.trees.bbox);
      })();
      const tiles = await treeTiles;
      return gzipSync(JSON.stringify({ type: 'FeatureCollection', features: tiles.get(`${x}/${y}`) || [] }));
    },
  },
  buildings: {
    tileType: 0, // GeoJSON FeatureCollection per zoom 16 tile, same payload as the online API
    tileCompression: 2,
    bbox: buildingsBbox,
    minZoom: 16,
    maxZoom: 16,
    concurrency: 2,
    attribution: 'Ville de Paris — ODbL',
    async tile(z, x, y) {
      const [west, south, east, north] = tileBounds(z, x, y);
      const footprint = [[west, south], [east, south], [east, north], [west, north], [west, south]]
        .map(([lng, lat]) => `${lng} ${lat}`).join(',');
      const url = new URL('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/volumesbatisparis/exports/geojson');
      url.search = new URLSearchParams({
        select: 'geom,h_et_max,nb_pl,b_rdc,objectid',
        where: `intersects(geom,geom'POLYGON((${footprint}))')`,
      });
      const data = JSON.parse(await download(url));
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error(`Invalid GeoJSON for ${z}/${x}/${y}`);
      return gzipSync(JSON.stringify(data));
    },
  },
  orthophotos: {
    tileType: 3,
    tileCompression: 1,
    bbox: buildingsBbox,
    minZoom,
    maxZoom,
    concurrency: 4,
    attribution: ignAttribution,
    tile: (z, x, y) => download(ignUrl('ORTHOIMAGERY.ORTHOPHOTOS', 'image/jpeg')(z, x, y)),
  },
  'plan-ign': {
    tileType: 2,
    tileCompression: 1,
    bbox: buildingsBbox,
    minZoom,
    maxZoom,
    concurrency: 4,
    attribution: ignAttribution,
    tile: (z, x, y) => download(ignUrl('GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 'image/png')(z, x, y)),
  },
  terrain: {
    tileType: 0,
    tileCompression: 2,
    bbox: buildingsBbox,
    minZoom: terrainZoom,
    maxZoom: terrainZoom,
    concurrency: 2,
    attribution: ignAttribution,
    metadata: { format: 'float32-le', source: 'IGN RGE ALTI', tileSize: 256 },
    tile: buildTerrainTile,
  },
};

function indexPointTiles(data, z, [west, south, east, north], idProperty = 'idbase', label = 'tree') {
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error(`Invalid ${label} GeoJSON`);
  const tiles = new Map();
  for (const feature of data.features) {
    const [lng, lat] = feature.geometry?.coordinates || [];
    if (feature.geometry?.type !== 'Point' || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new Error(`Invalid ${label} coordinates`);
    }
    if (lng < west || lng > east || lat < south || lat > north) continue;
    feature.id = feature.properties[idProperty];
    const key = `${lngToX(lng, z)}/${latToY(lat, z)}`;
    if (!tiles.has(key)) tiles.set(key, []);
    tiles.get(key).push(feature);
  }
  return tiles;
}

function lngToX(lng, z) {
  return Math.min(2 ** z - 1, Math.floor((lng + 180) / 360 * 2 ** z));
}

function latToY(lat, z) {
  const rad = lat * Math.PI / 180;
  return Math.min(2 ** z - 1, Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * 2 ** z));
}

// Building queries are limited to the shared archive bbox.
function tileBounds(z, x, y) {
  const lng = x => x / 2 ** z * 360 - 180;
  const lat = y => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / 2 ** z))) * 180 / Math.PI;
  return [
    Math.max(lng(x), buildingsBbox[0]),
    Math.max(lat(y + 1), buildingsBbox[1]),
    Math.min(lng(x + 1), buildingsBbox[2]),
    Math.min(lat(y), buildingsBbox[3]),
  ];
}

function tilesIn([west, south, east, north], minZoom, maxZoom) {
  const tiles = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    for (let x = lngToX(west, z); x <= lngToX(east, z); x++) {
      for (let y = latToY(north, z); y <= latToY(south, z); y++) tiles.push([z, x, y]);
    }
  }
  return tiles;
}

async function getTerrainSourceTile(x, y) {
  const key = `${x}/${y}`;
  if (!terrainSourceTiles.has(key)) {
    const url = new URL('https://data.geopf.fr/wmts');
    for (const [name, value] of Object.entries({
      SERVICE: 'WMTS',
      REQUEST: 'GetTile',
      VERSION: '1.0.0',
      LAYER: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
      STYLE: 'normal',
      FORMAT: 'image/x-bil;bits=32',
      TILEMATRIXSET: 'WGS84G_6_14',
      TILEMATRIX: terrainZoom,
      TILEROW: y,
      TILECOL: x,
    })) url.searchParams.set(name, value);
    terrainSourceTiles.set(key, download(url).then(data => {
      if (data.length !== 256 * 256 * 4) data = inflateSync(data);
      if (data.length !== 256 * 256 * 4) throw new Error(`Invalid IGN elevation tile ${key}`);
      return data;
    }).catch(error => {
      terrainSourceTiles.delete(key);
      throw error;
    }));
  }
  return terrainSourceTiles.get(key);
}

async function buildTerrainTile(z, x, y) {
  const toLatLng = (pixelX, pixelY) => {
    const scale = 256 * 2 ** z;
    const lng = pixelX / scale * 360 - 180;
    const mercatorY = Math.PI * (1 - 2 * pixelY / scale);
    return [lng, Math.atan(Math.sinh(mercatorY)) * 180 / Math.PI];
  };
  const sourceX = lng => Math.floor((lng + 180) / 360 * 2 ** (terrainZoom + 1));
  const sourceY = lat => Math.floor((90 - lat) / 180 * 2 ** terrainZoom);
  const corners = [
    toLatLng(x * 256, y * 256),
    toLatLng((x + 1) * 256, (y + 1) * 256),
  ];
  const minX = Math.max(0, Math.min(...corners.map(([lng]) => sourceX(lng))) - 1);
  const maxX = Math.min(2 ** (terrainZoom + 1) - 1, Math.max(...corners.map(([lng]) => sourceX(lng))) + 1);
  const minY = Math.max(0, Math.min(...corners.map(([, lat]) => sourceY(lat))) - 1);
  const maxY = Math.min(2 ** terrainZoom - 1, Math.max(...corners.map(([, lat]) => sourceY(lat))) + 1);
  const sources = new Map();
  await Promise.all(Array.from({ length: maxX - minX + 1 }, (_, column) =>
    Array.from({ length: maxY - minY + 1 }, (_, row) => {
      const sx = minX + column, sy = minY + row;
      return getTerrainSourceTile(sx, sy).then(data =>
        sources.set(`${sx}/${sy}`, new DataView(data.buffer, data.byteOffset, data.byteLength)));
    })
  ).flat());

  const sample = (lng, lat) => {
    const px = (lng + 180) / 360 * 2 ** (terrainZoom + 1) * 256 - 0.5;
    const py = (90 - lat) / 180 * 2 ** terrainZoom * 256 - 0.5;
    const x0 = Math.floor(px), y0 = Math.floor(py);
    const fx = px - x0, fy = py - y0;
    const at = (ix, iy) => {
      const sx = Math.floor(ix / 256), sy = Math.floor(iy / 256);
      const data = sources.get(`${sx}/${sy}`);
      if (!data) return -9999;
      return data.getFloat32(((iy - sy * 256) * 256 + ix - sx * 256) * 4, true);
    };
    const values = [at(x0, y0), at(x0 + 1, y0), at(x0, y0 + 1), at(x0 + 1, y0 + 1)];
    if (values.some(value => !Number.isFinite(value) || value <= -1000)) return -9999;
    const north = values[0] * (1 - fx) + values[1] * fx;
    const south = values[2] * (1 - fx) + values[3] * fx;
    return north * (1 - fy) + south * fy;
  };

  const output = Buffer.allocUnsafe(256 * 256 * 4);
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength);
  let validSamples = 0;
  for (let row = 0; row < 256; row++) {
    for (let column = 0; column < 256; column++) {
      const [lng, lat] = toLatLng(x * 256 + column + 0.5, y * 256 + row + 0.5);
      const elevation = sample(lng, lat);
      if (elevation > -1000) validSamples++;
      view.setFloat32((row * 256 + column) * 4, elevation, true);
    }
  }
  if (!validSamples) throw new Error(`No IGN elevation data in ${z}/${x}/${y}`);
  return gzipSync(output);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function download(url) {
  for (let attempt = 1; ; attempt++) {
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': 'leaflet-rotate offline example builder' } });
    } catch (error) {
      if (attempt === 5) throw error;
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (response.ok) {
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length) return data;
      if (attempt === 5) throw new Error(`Empty tile response for ${url}`);
    } else if ((response.status !== 400 && response.status !== 404 && response.status !== 429 && response.status < 500) || attempt === 5) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    await sleep(1000 * 2 ** attempt);
  }
}

// PMTiles v3 Hilbert tile id.
function tileId(z, x, y) {
  let id = (4 ** z - 1) / 3;
  const n = 2 ** z;
  for (let s = n / 2; s >= 1; s /= 2) {
    const rx = (x & s) ? 1 : 0;
    const ry = (y & s) ? 1 : 0;
    id += s * s * ((3 * rx) ^ ry);
    if (!ry) {
      if (rx) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      [x, y] = [y, x];
    }
  }
  return id;
}

function serializeDirectory(entries) {
  const bytes = [];
  const varint = value => {
    while (value >= 0x80) {
      bytes.push((value % 0x80) | 0x80);
      value = Math.floor(value / 0x80);
    }
    bytes.push(value);
  };
  varint(entries.length);
  let lastId = 0;
  for (const entry of entries) {
    varint(entry.tileId - lastId);
    lastId = entry.tileId;
  }
  for (const entry of entries) varint(entry.runLength);
  for (const entry of entries) varint(entry.length);
  entries.forEach((entry, i) => {
    const previous = entries[i - 1];
    varint(previous && entry.offset === previous.offset + previous.length ? 0 : entry.offset + 1);
  });
  return gzipSync(Buffer.from(bytes));
}

function buildDirectories(entries) {
  const maxRoot = 16384 - 127;
  const root = serializeDirectory(entries);
  if (root.length <= maxRoot) return { root, leaves: Buffer.alloc(0) };
  for (let size = 4096; ; size *= 2) {
    const leaves = [];
    const rootEntries = [];
    let offset = 0;
    for (let i = 0; i < entries.length; i += size) {
      const leaf = serializeDirectory(entries.slice(i, i + size));
      rootEntries.push({ tileId: entries[i].tileId, offset, length: leaf.length, runLength: 0 });
      leaves.push(leaf);
      offset += leaf.length;
    }
    const root = serializeDirectory(rootEntries);
    if (root.length <= maxRoot) return { root, leaves: Buffer.concat(leaves) };
  }
}

async function build(name, archive) {
  const tiles = tilesIn(archive.bbox, archive.minZoom, archive.maxZoom);
  const file = new URL(`paris-${name}.pmtiles`, outDir);
  const dataFile = new URL(`paris-${name}.pmtiles.data`, outDir);
  console.log(`${name}: ${tiles.length} tiles, zoom ${archive.minZoom}-${archive.maxZoom}`);

  // ponytail: no resume, an interrupted run starts over; add a tile cache if runs get long.
  const data = await open(dataFile, 'w');
  const entries = [];
  let dataLength = 0;
  let done = 0;
  let next = 0;
  try {
    const workers = await Promise.allSettled(Array.from({ length: archive.concurrency }, async () => {
      while (next < tiles.length) {
        const [z, x, y] = tiles[next++];
        const tile = await archive.tile(z, x, y);
        if (!tile?.length) throw new Error(`${name}: missing tile ${z}/${x}/${y}`);
        const offset = dataLength;
        dataLength += tile.length;
        let written = 0;
        while (written < tile.length) {
          const { bytesWritten } = await data.write(tile, written, tile.length - written, offset + written);
          if (!bytesWritten) throw new Error(`${name}: unable to write tile ${z}/${x}/${y}`);
          written += bytesWritten;
        }
        entries.push({ tileId: tileId(z, x, y), offset, length: tile.length, runLength: 1 });
        if (++done % 100 === 0 || done === tiles.length) console.log(`${name}: ${done}/${tiles.length}`);
      }
    }));
    const failed = workers.filter(worker => worker.status === 'rejected');
    if (failed.length) throw new AggregateError(failed.map(worker => worker.reason),
      `${name}: archive incomplete; not published (${failed.length} failed workers)`);
  } finally {
    await data.close();
  }

  entries.sort((a, b) => a.tileId - b.tileId);
  const expectedIds = tiles.map(([z, x, y]) => tileId(z, x, y)).sort((a, b) => a - b);
  if (entries.length !== expectedIds.length || entries.some((entry, i) => entry.tileId !== expectedIds[i]) ||
    (await stat(dataFile)).size !== dataLength) {
    throw new Error(`${name}: tile coverage or data length verification failed; archive not published`);
  }
  const { root, leaves } = buildDirectories(entries);
  const metadata = gzipSync(JSON.stringify({
    name: `paris-${name}`, attribution: archive.attribution, ...archive.metadata,
  }));
  const header = createHeader(entries, root, metadata, leaves, dataLength, archive);

  const partial = new URL(`paris-${name}.pmtiles.part`, outDir);
  const output = createWriteStream(partial);
  output.write(Buffer.concat([header, root, metadata, leaves]));
  await pipeline(createReadStream(dataFile), output);
  if ((await stat(partial)).size !== 127 + root.length + metadata.length + leaves.length + dataLength) {
    throw new Error(`${name}: truncated archive; not published`);
  }
  await rename(partial, file);
  await rm(dataFile);
  console.log(`${name}: wrote ${entries.length} tiles to ${fileURLToPath(file)}`);
}

async function buildArchives(names) {
  names = [...new Set(names)];
  for (const name of names) {
    if (!Object.hasOwn(archives, name)) throw new Error(`Unknown archive "${name}"`);
  }
  let next = 0;
  const errors = [];
  await Promise.all(Array.from({ length: Math.min(jobs, names.length) }, async () => {
    while (next < names.length && !errors.length) {
      const name = names[next++];
      try {
        await build(name, archives[name]);
      } catch (error) {
        errors.push(error);
      }
    }
  }));
  if (errors.length) throw new AggregateError(errors, 'Archive build failed; no further archives started');
}

const WORLD = 40075016.68557849, HALF = WORLD / 2, TILE = 256;
const MAX_FILE_BYTES = 25_000_000;
const CENTER = [12.49223, 41.89021];
const DEM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const cogSources = [
  {
    name: 'archaeology',
    source: 'https://repositar.archeositarproject.it/geoserver/ows',
    layer: 'cartografia_storica:Forma Urbis Romae - Lanciani',
    attribution: 'SITAR / SSABAP Roma - CC BY-SA 4.0',
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source_metadata: 'https://www.archeositarproject.it/webgis/',
  },
  {
    name: 'orthophoto',
    source: 'https://geoportale.regione.lazio.it/geoserver/ows',
    layer: 'geonode:2002_2003_CGR_25833_COG',
    attribution: 'Ortofoto CGR 2002/03 - Regione Lazio - CC BY 4.0',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    source_metadata: 'https://geoportale.regione.lazio.it/catalogue/#/dataset/765',
    license_statement: 'https://geoportale.regione.lazio.it/faq/servizi-wms-wfs-wcs-come-accedere-da-remoto-ai-livelli-del-geoportale/',
    acquisition_years: '2002/2003',
  },
];

function project([lon, lat]) {
  return [lon / 180 * HALF, Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI * HALF];
}

function unproject([x, y]) {
  return [x / HALF * 180, Math.atan(Math.sinh(y / HALF * Math.PI)) * 180 / Math.PI];
}

function coordinates(text, bbox = false) {
  const values = text.split(',').map(value => value.trim() ? Number(value) : NaN);
  const [west, south, east, north] = values;
  if (values.length !== (bbox ? 4 : 2) || !values.every(Number.isFinite) ||
    west < -180 || west > 180 || Math.abs(south) > 85.0511287798066 ||
    bbox && (!(west < east && east <= 180 && south < north) || Math.abs(north) > 85.0511287798066)) {
    throw new Error(bbox ? 'bbox must be ordered west,south,east,north within Web Mercator'
      : 'center must be longitude,latitude within Web Mercator');
  }
  return values;
}

function centeredTransform(center, side, zoom) {
  const [x, y] = project(center), resolution = WORLD / 2 ** zoom / TILE;
  const halfSide = side * resolution / 2;
  if (Math.abs(x) + halfSide > HALF || Math.abs(y) + halfSide > HALF) {
    throw new Error('centered square must fit within Web Mercator');
  }
  return { left: x - halfSide, top: y + halfSide, resolution };
}

function extent(transform, width, height) {
  const [west, north] = unproject([transform.left, transform.top]);
  const [east, south] = unproject([transform.left + width * transform.resolution,
    transform.top - height * transform.resolution]);
  return [west, south, east, north];
}

function gridFor(bbox, zoom, alignZoom = zoom) {
  const [west, north] = project([bbox[0], bbox[3]]);
  const [east, south] = project([bbox[2], bbox[1]]);
  const n = 2 ** alignZoom, span = WORLD / n, scale = 2 ** (zoom - alignZoom);
  const clamp = value => Math.max(0, Math.min(n - 1, value));
  const x0 = clamp(Math.floor((west + HALF) / span)), y0 = clamp(Math.floor((HALF - north) / span));
  const x1 = Math.max(x0, clamp(Math.ceil((east + HALF) / span) - 1));
  const y1 = Math.max(y0, clamp(Math.ceil((HALF - south) / span) - 1));
  return [x0 * scale, y0 * scale, (x1 + 1) * scale - 1, (y1 + 1) * scale - 1];
}

function padBounds(bounds, zoom, alignZoom = zoom) {
  const scale = 2 ** (zoom - alignZoom), blocks = 2 ** alignZoom;
  const pad = (start, end) => {
    const count = Math.max(Math.ceil(2 / scale), (end + 1 - start) / scale);
    const first = Math.max(0, Math.min(start / scale, blocks - count));
    return [first * scale, (first + count) * scale - 1];
  };
  const [x0, x1] = pad(bounds[0], bounds[2]), [y0, y1] = pad(bounds[1], bounds[3]);
  return [x0, y0, x1, y1];
}

function gridTransform([x, y], zoom) {
  const span = WORLD / 2 ** zoom;
  return { left: -HALF + x * span, top: HALF - y * span, resolution: span / TILE };
}

function dimensions(bounds) {
  const width = (bounds[2] - bounds[0] + 1) * TILE, height = (bounds[3] - bounds[1] + 1) * TILE;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < TILE || height < TILE ||
    width * height / TILE ** 2 > 1024) throw new Error('refusing to fetch more than 1024 tiles or an invalid grid');
  return { width, height };
}

function checkSize(name, size) {
  if (size > MAX_FILE_BYTES) throw new Error(`${name}: ${size} bytes exceeds hard limit ${MAX_FILE_BYTES}`);
}

async function downloadCog(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'leaflet-city-mapper offline COG builder' },
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status}`);
      }
      const chunks = [];
      let total = 0;
      for await (const chunk of response.body) {
        total += chunk.length;
        if (total > 5_000_000) throw new Error('response exceeds 5000000 bytes');
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw new Error(`request failed after 3 attempts: ${url}`, { cause: lastError });
}

function decodePng(bytes, label) {
  // Reject unexpected dimensions before the decoder allocates the image.
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    bytes.readUInt32BE(16) !== TILE || bytes.readUInt32BE(20) !== TILE) {
    throw new Error(`${label}: expected a 256x256 PNG tile`);
  }
  return PNG.sync.read(bytes).data;
}

function decodeTerrarium(rgba) {
  const result = new Float32Array(TILE * TILE);
  for (let i = 0; i < result.length; i++) {
    const value = rgba[i * 4] * 256 + rgba[i * 4 + 1] + rgba[i * 4 + 2] / 256 - 32768;
    if (rgba[i * 4 + 3] !== 255 || !Number.isFinite(value) || value < -12000 || value > 10000) {
      throw new Error('DEM contains missing or implausible elevations outside [-12000, 10000] meters');
    }
    result[i] = value;
  }
  return result;
}

async function fetchGrid(zoom, bounds, transform, source) {
  const { width, height } = dimensions(bounds), bands = source ? 3 : 1;
  const data = source ? new Uint8Array(width * height * bands) : new Float32Array(width * height);
  const columns = width / TILE, count = width * height / TILE ** 2;
  let next = 0;
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (next < count) {
      const index = next++, tx = index % columns, ty = Math.floor(index / columns);
      const x = bounds[0] + tx, y = bounds[1] + ty;
      let url;
      if (source) {
        const left = transform.left + tx * TILE * transform.resolution;
        const top = transform.top - ty * TILE * transform.resolution, span = TILE * transform.resolution;
        url = new URL(source.source);
        url.search = new URLSearchParams({
          SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: source.layer, STYLES: '',
          SRS: 'EPSG:3857', BBOX: [left, top - span, left + span, top].map(n => n.toFixed(12)).join(','),
          WIDTH: String(TILE), HEIGHT: String(TILE), FORMAT: 'image/png', TRANSPARENT: 'false',
        });
      } else url = DEM_URL.replace('{z}', zoom).replace('{x}', x).replace('{y}', y);
      const rgba = decodePng(await downloadCog(url), `${source?.name || 'Terrarium'} ${zoom}/${x}/${y}`);
      const pixels = source ? rgba : decodeTerrarium(rgba);
      for (let row = 0; row < TILE; row++) {
        for (let col = 0; col < TILE; col++) {
          const target = ((ty * TILE + row) * width + tx * TILE + col) * bands;
          const pixel = row * TILE + col;
          if (source) {
            if (rgba[pixel * 4 + 3] !== 255) throw new Error(`${url}: unexpected transparent WMS pixel`);
            data.set(rgba.subarray(pixel * 4, pixel * 4 + 3), target);
          } else data[target] = pixels[pixel];
        }
      }
    }
  }));
  return { width, height, bands, data };
}

function overview(image) {
  const { width, height, bands, data } = image;
  const result = new Uint8Array(width / 2 * height / 2 * bands);
  for (let y = 0; y < height / 2; y++) for (let x = 0; x < width / 2; x++) {
    for (let b = 0; b < bands; b++) {
      const top = (y * 2 * width + x * 2) * bands + b, bottom = top + width * bands;
      result[(y * width / 2 + x) * bands + b] = Math.round(
        (data[top] + data[top + bands] + data[bottom] + data[bottom + bands]) / 4);
    }
  }
  return { width: width / 2, height: height / 2, bands, data: result };
}

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}

function field(tag, type, values) {
  const size = { 2: 1, 3: 2, 4: 4, 12: 8 }[type];
  const data = type === 2 ? Buffer.from(`${values}\0`) : Buffer.alloc(values.length * size);
  if (type !== 2) values.forEach((value, i) => {
    if (type === 12) data.writeDoubleLE(value, i * size);
    else if (type === 4) data.writeUInt32LE(value, i * size);
    else data.writeUInt16LE(value, i * size);
  });
  return { tag, type, count: data.length / size, data };
}

function buildCog(image, transform, metadata, factors = []) {
  const levels = [image];
  for (const factor of factors) {
    if (factor !== 2 ** levels.length || image.bands !== 3) throw new Error('Invalid overview factors');
    levels.push(overview(levels.at(-1)));
  }
  const directories = levels.map((level, index) => {
    const { width, height, bands, data } = level;
    if (width % TILE || height % TILE) throw new Error('COG levels must contain whole 256px tiles');
    const floating = bands === 1, bytes = floating ? 4 : 1, tiles = [];
    for (let y = 0; y < height; y += TILE) for (let x = 0; x < width; x += TILE) {
      const raw = Buffer.alloc(TILE * TILE * bands * bytes);
      for (let row = 0; row < TILE; row++) {
        const start = ((y + row) * width + x) * bands;
        if (floating) {
          for (let col = 0; col < TILE; col++) raw.writeFloatLE(data[start + col], (row * TILE + col) * 4);
        } else raw.set(data.subarray(start, start + TILE * bands), row * TILE * bands);
      }
      tiles.push(deflateSync(raw));
    }
    const offsets = field(324, 4, tiles.map(() => 0));
    const resolution = transform.resolution * 2 ** index;
    const tags = [
      field(254, 4, [index ? 1 : 0]), field(256, 4, [width]), field(257, 4, [height]),
      field(258, 3, Array(bands).fill(floating ? 32 : 8)), field(259, 3, [8]),
      field(262, 3, [floating ? 1 : 2]), field(277, 3, [bands]), field(284, 3, [1]),
      field(317, 3, [1]), field(322, 4, [TILE]), field(323, 4, [TILE]), offsets,
      field(325, 4, tiles.map(tile => tile.length)), field(339, 3, Array(bands).fill(floating ? 3 : 1)),
      field(33550, 12, [resolution, resolution, 0]),
      field(33922, 12, [0, 0, 0, transform.left, transform.top, 0]),
      field(34735, 3, [1, 1, 0, 3, 1024, 0, 1, 1, 1025, 0, 1, 1, 3072, 0, 1, 3857]),
    ];
    if (!index) tags.push(field(42112, 2, `<GDALMetadata>${Object.entries({ ...metadata, AREA_OR_POINT: 'Area' })
      .map(([name, value]) => `<Item name="${xmlEscape(name)}">${xmlEscape(value)}</Item>`).join('')}</GDALMetadata>`));
    tags.sort((a, b) => a.tag - b.tag);
    return { tags, tiles, offsets };
  });
  // All directories and offset arrays precede imagery; smallest overview tiles come first.
  let cursor = 8;
  for (const directory of directories) {
    directory.offset = cursor;
    cursor += 2 + directory.tags.length * 12 + 4;
  }
  for (const directory of directories) for (const tag of directory.tags) if (tag.data.length > 4) {
    cursor = Math.ceil(cursor / 8) * 8;
    tag.offset = cursor;
    cursor += tag.data.length;
  }
  for (const directory of [...directories].reverse()) directory.tiles.forEach((tile, i) => {
    directory.offsets.data.writeUInt32LE(cursor, i * 4);
    cursor += tile.length;
  });
  checkSize('COG', cursor);
  const output = Buffer.alloc(cursor);
  output.write('II'); output.writeUInt16LE(42, 2); output.writeUInt32LE(8, 4);
  directories.forEach((directory, i) => {
    output.writeUInt16LE(directory.tags.length, directory.offset);
    directory.tags.forEach((tag, j) => {
      const entry = directory.offset + 2 + j * 12;
      output.writeUInt16LE(tag.tag, entry); output.writeUInt16LE(tag.type, entry + 2);
      output.writeUInt32LE(tag.count, entry + 4);
      if (tag.offset) output.writeUInt32LE(tag.offset, entry + 8);
      tag.data.copy(output, tag.offset ?? entry + 8);
    });
    output.writeUInt32LE(directories[i + 1]?.offset || 0, directory.offset + 2 + directory.tags.length * 12);
    directory.tiles.forEach((tile, j) => tile.copy(output, directory.offsets.data.readUInt32LE(j * 4)));
  });
  return output;
}

async function verifyCog(output, image, transform, metadata, factors) {
  checkSize('COG', output.length);
  assert.equal(output.toString('ascii', 0, 4), 'II*\0');
  const source = { full: output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength),
    size: output.length, little: true };
  let offset = output.readUInt32LE(4), index = 0, level = image, firstData = Infinity, lastDirectoryEnd = 0;
  const allTiles = [];
  while (offset) {
    assert.ok(index <= factors.length, 'Too many image directories');
    const { tags, next } = await readCogDirectory(source, offset);
    lastDirectoryEnd = Math.max(lastDirectoryEnd, offset + 2 + output.readUInt16LE(offset) * 12 + 4);
    for (let i = 0; i < output.readUInt16LE(offset); i++) {
      const entry = offset + 2 + i * 12, type = output.readUInt16LE(entry + 2);
      const length = output.readUInt32LE(entry + 4) * ({ 2: 1, 3: 2, 4: 4, 12: 8 }[type]);
      if (length > 4) lastDirectoryEnd = Math.max(lastDirectoryEnd, output.readUInt32LE(entry + 8) + length);
    }
    assert.deepEqual(tags.get(256), [level.width]); assert.deepEqual(tags.get(257), [level.height]);
    assert.deepEqual(tags.get(258), Array(image.bands).fill(image.bands === 3 ? 8 : 32));
    for (const [tag, value] of [[259, 8], [262, image.bands === 3 ? 2 : 1], [277, image.bands],
      [284, 1], [317, 1], [322, TILE], [323, TILE]]) assert.deepEqual(tags.get(tag), [value]);
    assert.deepEqual(tags.get(339), Array(image.bands).fill(image.bands === 3 ? 1 : 3));
    assert.deepEqual(tags.get(33550), [transform.resolution * 2 ** index, transform.resolution * 2 ** index, 0]);
    assert.deepEqual(tags.get(33922), [0, 0, 0, transform.left, transform.top, 0]);
    assert.deepEqual(tags.get(34735), [1, 1, 0, 3, 1024, 0, 1, 1, 1025, 0, 1, 1, 3072, 0, 1, 3857]);
    const offsets = tags.get(324), lengths = tags.get(325);
    assert.equal(offsets.length, level.width * level.height / TILE ** 2);
    assert.equal(lengths.length, offsets.length);
    for (let tile = 0; tile < offsets.length; tile++) {
      const start = offsets[tile], length = lengths[tile], bands = image.bands;
      assert.ok(start + length <= output.length);
      firstData = Math.min(firstData, start);
      allTiles.push([index, start, length]);
      const raw = inflateSync(output.subarray(start, start + length), { maxOutputLength: TILE * TILE * bands * (bands === 1 ? 4 : 1) });
      assert.equal(raw.length, TILE * TILE * bands * (bands === 1 ? 4 : 1));
      const x = tile % (level.width / TILE) * TILE, y = Math.floor(tile / (level.width / TILE)) * TILE;
      for (let row = 0; row < TILE; row++) {
        const begin = ((y + row) * level.width + x) * bands;
        if (bands === 3) assert.deepEqual(raw.subarray(row * TILE * bands, (row + 1) * TILE * bands),
          Buffer.from(level.data.subarray(begin, begin + TILE * bands)));
        else for (let col = 0; col < TILE; col++) assert.equal(raw.readFloatLE((row * TILE + col) * 4), level.data[begin + col]);
      }
    }
    if (!index) for (const value of Object.values(metadata)) assert.ok(output.includes(Buffer.from(xmlEscape(value))));
    index++; offset = next;
    if (offset) level = overview(level);
  }
  assert.equal(index, factors.length + 1);
  assert.ok(lastDirectoryEnd <= firstData, 'All TIFF directories must precede tile data');
  allTiles.sort((a, b) => a[1] - b[1]);
  for (let i = 1; i < allTiles.length; i++) {
    assert.ok(allTiles[i - 1][0] >= allTiles[i][0], 'Smallest overview tiles must precede full resolution');
    assert.equal(allTiles[i - 1][1] + allTiles[i - 1][2], allTiles[i][1], 'Tiles must be contiguous and non-overlapping');
  }
}

async function selfTestCog() {
  const transform = centeredTransform(CENTER, 2048, 17), [cx, cy] = project(CENTER);
  assert.equal(transform.left + 1024 * transform.resolution, cx);
  assert.equal(transform.top - 1024 * transform.resolution, cy);
  const bbox = extent(transform, 2048, 2048), grid = padBounds(gridFor(bbox, 14), 14);
  const dem = extent(gridTransform(grid, 14), dimensions(grid).width, dimensions(grid).height);
  assert.ok(dem[0] <= bbox[0] && dem[1] <= bbox[1] && dem[2] >= bbox[2] && dem[3] >= bbox[3]);
  const aligned = padBounds(gridFor(bbox, 17, 14), 17, 14);
  assert.ok(aligned[0] % 8 === 0 && aligned[1] % 8 === 0 && (aligned[2] + 1) % 8 === 0);
  const edge = padBounds(gridFor([179.99, 0, 180, 0.01], 14), 14);
  assert.equal(edge[2], 2 ** 14 - 1);
  assert.throws(() => coordinates('12,,41'), /center/);
  assert.throws(() => coordinates('13,42,12,41', true), /bbox/);
  assert.throws(() => centeredTransform([180, 0], 2048, 17), /fit/);
  assert.throws(() => dimensions([0, 0, 32, 31]), /1024/);
  checkSize('test', MAX_FILE_BYTES);
  assert.throws(() => checkSize('test', MAX_FILE_BYTES + 1), /hard limit/);
  const png = new PNG({ width: TILE, height: TILE });
  for (let i = 0; i < TILE * TILE; i++) png.data.set([128, 128, i % 256, 255], i * 4);
  const rgba = decodePng(PNG.sync.write(png), 'test');
  const heights = decodeTerrarium(rgba);
  assert.equal(heights[0], 128); assert.equal(heights[255], 128 + 255 / 256);
  assert.throws(() => decodePng(Buffer.from('<ServiceException/>'), 'test'), /PNG/);
  assert.throws(() => decodeTerrarium(new Uint8Array(TILE * TILE * 4)), /missing/);
  const rgb = new Uint8Array(512 * 512 * 3);
  for (let i = 0; i < rgb.length; i++) rgb[i] = (i * 13 + Math.floor(i / 1536)) % 256;
  const image = { width: 512, height: 512, bands: 3, data: rgb };
  const averaged = overview(image);
  assert.equal(averaged.data[0], Math.round((rgb[0] + rgb[3] + rgb[1536] + rgb[1539]) / 4));
  assert.equal(averaged.width, 256);
  const originalFetch = globalThis.fetch, requests = [];
  globalThis.fetch = async url => {
    requests.push(String(url));
    return new Response(PNG.sync.write(png));
  };
  try {
    const fetched = await fetchGrid(17, [0, 0, 1, 0], transform, cogSources[0]);
    assert.equal(requests.length, 2);
    for (let tile = 0; tile < requests.length; tile++) {
      const request = new URL(requests[tile]), bounds = request.searchParams.get('BBOX').split(',').map(Number);
      assert.equal(request.searchParams.get('LAYERS'), cogSources[0].layer);
      assert.ok(Math.abs(bounds[0] - (transform.left + tile * TILE * transform.resolution)) < 1e-8);
    }
    assert.deepEqual([...fetched.data.subarray(0, 3)], [128, 128, 0]);
    assert.deepEqual([...fetched.data.subarray(TILE * 3, TILE * 3 + 3)], [128, 128, 0]);
    const demGrid = await fetchGrid(14, [8760, 6088, 8760, 6088], gridTransform([8760, 6088], 14));
    assert.deepEqual(demGrid.data, heights);
    assert.equal(requests.at(-1), DEM_URL.replace('{z}', 14).replace('{x}', 8760).replace('{y}', 6088));
  } finally { globalThis.fetch = originalFetch; }
  const metadata = { source: 'test & <source>', attribution: 'Fixture', license: 'Fixture only' };
  await verifyCog(buildCog(image, transform, metadata, [2]), image, transform, metadata, [2]);
  const elevation = { width: TILE, height: TILE, bands: 1, data: heights }, demTransform = gridTransform(grid, 14);
  await verifyCog(buildCog(elevation, demTransform, metadata), elevation, demTransform, metadata, []);
  console.log('COG exact center, tile alignment, PNG/Terrarium decoding, RGB/Float32 TIFF round-trips, overviews, metadata, layout and size limit: OK');
}


function createHeader(entries, root, metadata, leaves, dataLength, archive) {
  const header = Buffer.alloc(127);
  const u64 = (offset, value) => header.writeBigUInt64LE(BigInt(value), offset);
  const e7 = (offset, value) => header.writeInt32LE(Math.round(value * 1e7), offset);
  const [west, south, east, north] = archive.bbox;
  header.write('PMTiles', 0);
  header[7] = 3;
  u64(8, 127);
  u64(16, root.length);
  u64(24, 127 + root.length);
  u64(32, metadata.length);
  u64(40, 127 + root.length + metadata.length);
  u64(48, leaves.length);
  u64(56, 127 + root.length + metadata.length + leaves.length);
  u64(64, dataLength);
  u64(72, entries.length);
  u64(80, entries.length);
  u64(88, entries.length);
  header[96] = 0;
  header[97] = 2;
  header[98] = archive.tileCompression;
  header[99] = archive.tileType;
  header[100] = archive.minZoom;
  header[101] = archive.maxZoom;
  e7(102, west);
  e7(106, south);
  e7(110, east);
  e7(114, north);
  header[118] = archive.maxZoom;
  e7(119, (west + east) / 2);
  e7(123, (south + north) / 2);

  return header;
}

function packColosseum(assets, bbox) {
  const entries = [], manifest = {};
  let length = 0;
  for (const [name, data] of Object.entries(assets)) {
    const index = entries.length;
    entries.push({ tileId: index + 1, offset: length, length: data.length, runLength: 1 });
    manifest[name] = { offset: length, length: data.length };
    length += data.length;
  }
  const { root, leaves } = buildDirectories(entries);
  const metadata = gzipSync(JSON.stringify({
    name: 'colosseum', format: 'cog-assets-v1', cog_assets: manifest,
    description: 'Named EPSG:3857 COG assets. PMTiles tile type Unknown; payloads are complete TIFFs, not ordinary XYZ image tiles.',
    attribution: cogSources.map(source => source.attribution).concat('Mapzen Terrain Tiles / Copernicus EU-DEM').join('; '),
    sources: cogSources, elevation: { source: DEM_URL, license: 'https://registry.opendata.aws/terrain-tiles/' },
  }));
  const header = createHeader(entries, root, metadata, leaves, length,
    { bbox, minZoom: 1, maxZoom: 1, tileCompression: 1, tileType: 0 });
  const output = Buffer.concat([header, root, metadata, leaves, ...Object.values(assets)]);
  checkSize('colosseum.pmtiles', output.length);
  const decoded = decodeHeader(output.buffer.slice(output.byteOffset, output.byteOffset + 127));
  assert.equal(decoded.tileDataLength, length);
  const raw = gunzipSync(root);
  const directory = decodeDirectory(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
  assert.equal(directory.length, entries.length);
  for (const [i, [name, data]] of Object.entries(assets).entries()) {
    assert.deepEqual(directory[i], entries[i]);
    const start = decoded.tileDataOffset + manifest[name].offset;
    assert.deepEqual(output.subarray(start, start + data.length), data);
  }
  return output;
}

async function buildColosseum() {
  const zoom = Number(args['imagery-zoom']), minZoom = Number(args['overview-min-zoom']);
  const elevationZoom = Number(args['elevation-zoom']), side = Number(args.side);
  if (![zoom, minZoom, elevationZoom].every(Number.isInteger) ||
    !(0 <= minZoom && minZoom <= zoom && zoom <= 19 && 0 <= elevationZoom && elevationZoom <= 19)) {
    throw new Error('zooms must satisfy 0 <= overview-min-zoom <= imagery-zoom <= 19; elevation zoom <= 19');
  }
  const center = coordinates(args.center), factors = Array.from({ length: zoom - minZoom }, (_, i) => 2 ** (i + 1));
  let imageryBounds, transform;
  if (args.bbox) {
    imageryBounds = padBounds(gridFor(coordinates(args.bbox, true), zoom, minZoom), zoom, minZoom);
    transform = gridTransform(imageryBounds, zoom);
  } else {
    const minimum = TILE * (factors.at(-1) || 1);
    if (!Number.isSafeInteger(side) || side < minimum || !Number.isInteger(Math.log2(side))) {
      throw new Error(`side must be a power of two >= ${minimum} for whole overview tiles`);
    }
    transform = centeredTransform(center, side, zoom);
    imageryBounds = [0, 0, side / TILE - 1, side / TILE - 1];
  }
  const { width, height } = dimensions(imageryBounds), bbox = extent(transform, width, height);
  const elevationBounds = padBounds(gridFor(bbox, elevationZoom), elevationZoom);
  dimensions(elevationBounds);
  const assets = {};
  for (const { name, ...source } of cogSources) {
    console.log(`Colosseum ${name}: zoom ${zoom}, ${width / TILE}x${height / TILE} tiles`);
    const image = await fetchGrid(zoom, imageryBounds, transform, { name, ...source });
    const metadata = { ...source, zoom: String(zoom), overview_min_zoom: String(minZoom),
      processing: 'WMS EPSG:3857 RGB crop; DEFLATE COG; averaged overviews' };
    assets[name] = buildCog(image, transform, metadata, factors);
    await verifyCog(assets[name], image, transform, metadata, factors);
  }
  const demTransform = gridTransform(elevationBounds, elevationZoom);
  console.log(`Colosseum elevation: zoom ${elevationZoom}`);
  const image = await fetchGrid(elevationZoom, elevationBounds, demTransform);
  const metadata = { source: DEM_URL, zoom: String(elevationZoom),
    attribution: 'Mapzen Terrain Tiles; Europe source: Copernicus EU-DEM; see https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
    license: 'https://registry.opendata.aws/terrain-tiles/',
    encoding: 'Terrarium RGB: R*256 + G + B/256 - 32768; meters' };
  assets.elevation = buildCog(image, demTransform, metadata);
  await verifyCog(assets.elevation, image, demTransform, metadata, []);
  const output = packColosseum(assets, bbox);
  const directory = fileURLToPath(outDir), temporary = await mkdtemp(join(directory, '.colosseum-build-'));
  try {
    const staged = join(temporary, 'colosseum.pmtiles');
    await writeFile(staged, output);
    assert.deepEqual(await readFile(staged), output);
    await rename(staged, join(directory, 'colosseum.pmtiles'));
    // Remove only the legacy assets, and only after the combined archive is published.
    for (const name of Object.keys(assets)) await rm(join(directory, `colosseum-${name}.tif`), { force: true });
    console.log(`colosseum.pmtiles: ${output.length.toLocaleString('en-US')} bytes; 3 COG assets; legacy TIFFs removed`);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

if (args.help) {
  console.log(`Usage: node build/pmtiles.js [--only=buildings,trees,streetlights,orthophotos,plan-ign,terrain,colosseum]
Paris defaults are unchanged. Add --only=colosseum for one combined Colosseum PMTiles.
Colosseum: --center=12.49223,41.89021 --side=2048 --imagery-zoom=17
           --overview-min-zoom=14 --elevation-zoom=14 [--bbox=west,south,east,north]
Shared: --out-dir=directory --jobs=3 --self-test --help
Colosseum contains named COG assets (custom payloads), is limited to 25,000,000 bytes,
and removes the three legacy TIFF files only after successful publication.`);
} else if (args['self-test']) {
  await selfTestCog();
  const fixture = Buffer.from('II*\0fixture');
  packColosseum({ archaeology: fixture, orthophoto: fixture, elevation: fixture }, [12, 41, 13, 42]);
  console.log('Combined PMTiles directory, metadata, COG asset offsets and size limit: OK');
} else {
  const names = [...new Set(args.only.split(','))];
  for (const name of names) if (name !== 'colosseum' && !Object.hasOwn(archives, name)) throw new Error(`Unknown archive "${name}"`);
  await mkdir(outDir, { recursive: true });
  await buildArchives(names.filter(name => name !== 'colosseum'));
  if (names.includes('colosseum')) await buildColosseum();
}
