import { getZxy } from './getZxy.js';

export async function loadSource(backend, area) {
  if (backend._geojson && backend.options.data) {
    return backend.options.data;
  }
  if (backend._geojson && backend.options.url) {
    return (await fetch(new URL(backend.options.url, document.baseURI), { signal: area.request.signal })).json();
  }
  const result = await getZxy(backend, area.coords.z, area.coords.x, area.coords.y, area.request.signal);
  return result
    ? JSON.parse(new TextDecoder().decode(result.data))
    : { type: 'FeatureCollection', features: [] };
}
