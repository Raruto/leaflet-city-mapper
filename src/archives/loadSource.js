import { sceneByLayer } from '../globals/sceneByLayer.js';
import { archiveDecoder } from '../globals/archiveDecoder.js';

import { getZxy } from './getZxy.js';


export async function loadSource(layer, area) {
  if (sceneByLayer.get(layer)._geojson) {
    const { data, url } = layer.options;
    if (data !== undefined && url) {
      throw /* allocation: required -- Preserve the stack of this ambiguous source configuration. */ new Error('GeoJSON source requires either data or url');
    }
    if (data !== undefined) return data;
    if (!url) {
      throw /* allocation: required -- Preserve the stack of this missing source configuration. */ new Error('GeoJSON source requires either data or url');
    }
    const sourceUrl = /* allocation: required -- Resolve this source URL against the current document. */ new URL(url, document.baseURI);
    const response = await fetch(sourceUrl, /* allocation: required -- Each source request owns its abort signal. */ { signal: area.request.signal });
    if (!response.ok) {
      throw /* allocation: required -- Preserve the stack and status of this failed source request. */ new Error(`Unable to load GeoJSON: HTTP ${response.status}`);
    }
    return response.json();
  }
  const result = await getZxy(layer, area.coords.z, area.coords.x, area.coords.y, area.request.signal);
  return result
    ? JSON.parse(archiveDecoder.decode(result.data))
    : /* allocation: required -- Each empty source result must be independently mutable. */ {
      type: 'FeatureCollection',
      features: /* allocation: required -- Empty results must not share a mutable feature array. */ [],
    };
}
