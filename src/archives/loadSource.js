import { getZxy } from './getZxy.js';

export async function loadSource(backend, area) {
  if (backend._geojson) {
    const { data, url } = backend.options;
    if (data !== undefined && url) throw new Error('GeoJSON source requires either data or url');
    if (data !== undefined) return data;
    if (!url) throw new Error('GeoJSON source requires either data or url');
    const response = await fetch(new URL(url, document.baseURI), { signal: area.request.signal });
    if (!response.ok) throw new Error(`Unable to load GeoJSON: HTTP ${response.status}`);
    return response.json();
  }
  const result = await getZxy(backend, area.coords.z, area.coords.x, area.coords.y, area.request.signal);
  return result
    ? JSON.parse(new TextDecoder().decode(result.data))
    : { type: 'FeatureCollection', features: [] };
}
