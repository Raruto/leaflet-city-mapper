import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { archiveDecoder } from '../globals/archiveDecoder.js';
import { getZxy } from './getZxy.js';

/**
 * Load GeoJSON from inline data, a URL or the requested archive tile.
 *
 * @param {L.Layer} layer Source layer.
 * @param {Object} area Area coordinates and request controller.
 *
 * @returns {Promise<Object>} GeoJSON data, or an empty collection on an archive miss.
 *
 * @throws {Error} If both inline data and a URL are supplied.
 * @throws {Error} If neither inline data nor a URL is supplied for a GeoJSON source.
 * @throws {Error} If the GeoJSON request returns a non-success status.
 */
export async function loadSource(layer, area) {
  if (geojsonByLayer.get(layer)) {
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
