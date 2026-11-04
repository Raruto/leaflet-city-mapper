const line = { type: 'LineString', coordinates: [[2.294, 48.858], [2.315, 48.858]] };
const path = { type: 'Feature', geometry: line, properties: {
  osm_id: 1, nom: 'Test shared path', amenagement: 'voie verte', date_export: '2026-11-01',
} };

export function trafficResponse(href) {
  const url = new URL(href), dataset = url.pathname.split('/datasets/')[1]?.split('/')[0];
  if (dataset === 'amenagements-cyclables') return { type: 'FeatureCollection', features: [path] };
  if (dataset === 'traces-des-lignes-de-transport-en-commun-idfm') {
    const type = url.searchParams.get('where').match(/route_type = '([^']+)'/)?.[1];
    return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: line,
      properties: { route_id: type, route_short_name: '1', route_type: type, route_color: 'FF0000' } }] };
  }
  if (url.searchParams.get('select')?.startsWith('max(')) {
    return { total_count: 1, results: [{ latest: '2026-11-03T22:00:00Z', hour: '2026-11-03T22:00:00Z' }] };
  }
  if (dataset === 'comptage-velo-donnees-compteurs') {
    return { total_count: 1, results: [{ id_compteur: 'test-counter', sum_counts: 180, date: '2026-11-03T22:00:00Z',
      coordinates: { lon: 2.295, lat: 48.858 } }] };
  }
  if (dataset === 'comptages-routiers-permanents') {
    return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: line,
      properties: { q: 360, libelle: 'Test road' } }] };
  }
  throw new Error(`Unexpected traffic request: ${href}`);
}

export function fulfillTrafficRoute(route) {
  return route.fulfill({ contentType: 'application/json', body: JSON.stringify(trafficResponse(route.request().url())) });
}
