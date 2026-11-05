import { readCog } from './readCog.js';
import { readCogDirectory } from './readCogDirectory.js';
import { getCogTile } from './getCogTile.js';
import { getCogHeader } from './getCogHeader.js';
import { openCogAsset } from './openCogAsset.js';

/** EPSG:3857 COGs, standalone or named assets in a PMTiles container. */
export async function openCog(url, asset) {
  const source = asset === undefined ? /* alloc */ { url } : await openCogAsset(url, asset);
  source.levels = /* alloc */ new Map();
  const header = /* alloc */ new DataView(await readCog(source, 0, 8));
  const order = header.getUint16(0);
  if (order !== 0x4949 && order !== 0x4d4d) throw /* alloc */ new Error('Invalid TIFF byte order');
  source.little = order === 0x4949;
  if (header.getUint16(2, source.little) !== 42) throw /* alloc */ new Error('Expected classic TIFF (BigTIFF is not supported)');
  let offset = header.getUint32(4, source.little), base, elevation, minZoom = Infinity, maxZoom = -Infinity;
  const seen = /* alloc */ new Set(), half = 20037508.342789244;
  let directory, tags, width, height, samples, bits, format, keys, scale, tie, resolution, zoom, span, x, y, level;
  let i, value, bytes, unsigned, floating, finite, projected, area;
  while (offset) {
    if (seen.has(offset) || seen.size >= 24) throw /* alloc */ new Error('Cyclic or excessive COG directories');
    seen.add(offset);
    directory = await readCogDirectory(source, offset);
    tags = directory.tags;
    width = tags.get(256)?.[0]; height = tags.get(257)?.[0]; samples = tags.get(277)?.[0] ?? 1;
    bits = tags.get(258); format = tags.get(339) || /* alloc */ [1];
    bytes = true; unsigned = true; floating = true;
    for (value of bits || /* alloc */ []) bytes &&= value === 8;
    for (value of format) { unsigned &&= value === 1; floating &&= value === 3; }
    elevation = samples === 1 && bits?.length === 1 && bits[0] === 32 && floating;
    if (!width || !height || width % 256 || height % 256 || tags.get(322)?.[0] !== 256 ||
      tags.get(323)?.[0] !== 256 || tags.get(259)?.[0] !== 1 && tags.get(259)?.[0] !== 8 ||
      (tags.get(284)?.[0] ?? 1) !== 1 || (tags.get(317)?.[0] ?? 1) !== 1 ||
      (elevation ? tags.get(262)?.[0] !== 1 : samples !== 3 && samples !== 4 ||
        bits?.length !== samples || !bytes || !unsigned || tags.get(262)?.[0] !== 2)) {
      throw /* alloc */ new Error('Unsupported COG profile: expected tiled 256px RGB(A) Uint8 or Float32, DEFLATE without predictor');
    }
    if (!base) {
      keys = tags.get(34735); scale = tags.get(33550); tie = tags.get(33922);
      finite = true; projected = false; area = false;
      for (value of scale || /* alloc */ []) finite &&= Number.isFinite(value);
      for (value of tie || /* alloc */ []) finite &&= Number.isFinite(value);
      if (keys) for (i = 4; i < keys.length; i += 4) {
        if (keys[i + 1] !== 0 || keys[i + 2] !== 1) continue;
        if (keys[i] === 3072 && keys[i + 3] === 3857) projected = true;
        if (keys[i] === 1025 && keys[i + 3] === 1) area = true;
      }
      if (!keys || keys[0] !== 1 || keys.length !== 4 + keys[3] * 4 ||
        !scale || scale.length !== 3 || !finite ||
        !(scale[0] > 0) || Math.abs(scale[0] - scale[1]) > 1e-8 ||
        !tie || tie.length !== 6 || tie[0] !== 0 || tie[1] !== 0 || !projected || !area) {
        throw /* alloc */ new Error('COG must use north-up EPSG:3857 PixelIsArea georeferencing');
      }
      base = /* alloc */ { width, height, resolution: scale[0], left: tie[3], top: tie[4], elevation };
    }
    resolution = base.resolution * base.width / width;
    zoom = Math.round(Math.log2(half * 2 / (256 * resolution)));
    span = half * 2 / 2 ** zoom;
    x = (base.left + half) / span; y = (half - base.top) / span;
    if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x);
    if (Math.abs(y - Math.round(y)) < 1e-6) y = Math.round(y);
    if (zoom < 0 || zoom > 24 || Math.abs(half * 2 / (256 * 2 ** zoom) - resolution) > resolution * 1e-7 ||
      elevation && (!Number.isInteger(x) || !Number.isInteger(y)) ||
      Math.abs(base.width / width - base.height / height) > 1e-7 || elevation !== base.elevation ||
      x < 0 || y < 0 || x + width / 256 > 2 ** zoom || y + height / 256 > 2 ** zoom ||
      source.levels.has(zoom) || base.elevation && source.levels.size) {
      throw /* alloc */ new Error('COG levels must align with the Web Mercator XYZ tile grid');
    }
    level = /* alloc */ { x, y, columns: width / 256, rows: height / 256, samples, elevation,
      compression: tags.get(259)[0], offsets: tags.get(324), lengths: tags.get(325) };
    if (level.offsets?.length !== level.columns * level.rows || level.lengths?.length !== level.offsets.length) {
      throw /* alloc */ new Error('Invalid COG tile offsets or lengths');
    }
    for (i = 0; i < level.offsets.length; i++) {
      if (!level.offsets[i] || !level.lengths[i] || level.lengths[i] > 1048576 ||
        level.offsets[i] + level.lengths[i] > source.size) throw /* alloc */ new Error('Invalid COG tile offsets or lengths');
    }
    source.levels.set(zoom, level);
    minZoom = Math.min(minZoom, zoom); maxZoom = Math.max(maxZoom, zoom);
    offset = directory.next;
  }
  if (!base) throw /* alloc */ new Error('COG has no image directory');
  if (source.levels.size !== maxZoom - minZoom + 1) throw /* alloc */ new Error('COG overview zooms must be contiguous');
  const left = base.left + base.resolution / 2, right = base.left + (base.width - 0.5) * base.resolution;
  const top = base.top - base.resolution / 2, bottom = base.top - (base.height - 0.5) * base.resolution;
  source.header = /* alloc */ {
    minZoom, maxZoom, tileType: base.elevation ? 0 : 2,
    minLon: left / half * 180, maxLon: right / half * 180,
    minLat: Math.atan(Math.sinh(bottom / half * Math.PI)) * 180 / Math.PI,
    maxLat: Math.atan(Math.sinh(top / half * Math.PI)) * 180 / Math.PI,
  };
  return /* alloc */ {
    getHeader: getCogHeader.bind(null, source),
    getZxy: getCogTile.bind(null, source),
  };
}
