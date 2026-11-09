import { readTileJSON } from './readTileJSON.js';
import { readVectorStyle } from './readVectorStyle.js';
import { validateVectorTileZooms } from './validateVectorTileZooms.js';

export async function vectorTileSettings(options) {
  if (!options || typeof options !== 'object') throw /* alloc */ new TypeError('Vector tiles require source options');
  if (options.tileJSON) options = await readTileJSON(options);
  let { url, style, minNativeZoom = 0, maxNativeZoom = 14, maxZoom = 19 } = options;
  let key;
  if (typeof url === 'string') url = url.replaceAll(/%7B([zxy])%7D/gi, '{$1}');
  for (key of /* alloc */ ['{z}', '{x}', '{y}']) {
    if (typeof url !== 'string' || !url.includes(key)) throw /* alloc */ new Error('Vector tiles require an XYZ URL template');
  }
  validateVectorTileZooms(minNativeZoom, maxNativeZoom, maxZoom);
  style = await readVectorStyle(style);
  return /* alloc */ { ...options, url, style, minNativeZoom, maxNativeZoom, maxZoom };
}
