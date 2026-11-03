import { getZxy } from './getZxy';


export async function loadSource(backend, area) {
  if (backend._geojson) {
    const { data, url } = backend.options;
    if (typeof backend.options.featureStyle !== 'function') {
      throw new Error('featureStyle must be a function');
    }
    if ((data !== undefined) === (url !== undefined)) {
      throw new Error('GeoJSON source requires either data or url');
    }
    if (data !== undefined) return data;
    if (typeof url !== 'string' || !url.trim()) throw new Error('Invalid GeoJSON URL');
    const response = await fetch(new URL(url, document.baseURI), { signal: area.request.signal });
    if (!response.ok) throw new Error(`Unable to load GeoJSON: HTTP ${response.status}`);
    return response.json();
  }
  const { z, x, y } = area.coords;
  const result = await getZxy(backend, z, x, y, area.request.signal);
  return result ? JSON.parse(new TextDecoder().decode(result.data))
    : { type: 'FeatureCollection', features: [] };
}
