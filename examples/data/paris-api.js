/** Fresh open-data requests; callers cache results only for their layer's lifetime. */
export async function parisAPI(dataset, endpoint, query, signal) {
  const url = new URL(`https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/${dataset}/${endpoint}`);
  url.search = new URLSearchParams(query);
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`${dataset}: HTTP ${response.status}`);
  return response.json();
}

export async function parisRecords(dataset, query, signal) {
  const records = [];
  let total;
  do {
    const data = await parisAPI(dataset, 'records', { ...query, limit: 100, offset: records.length }, signal);
    if (!Array.isArray(data.results) || !Number.isSafeInteger(data.total_count) ||
      data.results.length === 0 && records.length < data.total_count) throw new Error(`Invalid records: ${dataset}`);
    total = data.total_count;
    records.push(...data.results);
  } while (records.length < total);
  return records;
}

export function trafficBounds(layer) {
  return layer.options.bounds || [2.26, 48.835, 2.38, 48.885];
}

export function boundsQuery(field, bounds) {
  const [west, south, east, north] = bounds;
  return `intersects(${field},geom'POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))')`;
}
