import { sceneByLayer } from '../globals/sceneByLayer.js';
import { archiveDecoder } from '../globals/archiveDecoder.js';

import { getZxy } from './getZxy.js';


export async function loadSource(layer, area) {
  if (sceneByLayer.get(layer)._geojson) {
    const { data, url } = layer.options;
    if (data !== undefined && url) {
      throw /* alloc */ new Error('GeoJSON source requires either data or url');
    }
    if (data !== undefined) return data;
    if (!url) {
      throw /* alloc */ new Error('GeoJSON source requires either data or url');
    }
    const sourceUrl = /* alloc */ new URL(url, document.baseURI);
    const response = await fetch(sourceUrl, /* alloc */ { signal: area.request.signal });
    if (!response.ok) {
      throw /* alloc */ new Error(`Unable to load GeoJSON: HTTP ${response.status}`);
    }
    return response.json();
  }
  const result = await getZxy(layer, area.coords.z, area.coords.x, area.coords.y, area.request.signal);
  return result
    ? JSON.parse(archiveDecoder.decode(result.data))
    : /* alloc */ {
      type: 'FeatureCollection',
      features: /* alloc */ [],
    };
}
