import { readCog } from './readCog.js';
import { readCogDirectories } from './readCogDirectories.js';
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
  const { base, minZoom, maxZoom } = await readCogDirectories(source, header.getUint32(4, source.little));
  const half = 20037508.342789244;
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
