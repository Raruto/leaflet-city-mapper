import { mobilityLanes } from './mobilityLanes.js';
import { parisAPI, parisRecords, trafficBounds, boundsQuery } from './paris-api.js';
import { cyclingCounts } from './cyclingCounts.js';
import { trafficHour } from './paris-traffic.js';

const cache = new WeakMap();

export default async function parisMobility(time, layer, signal) {
  signal.throwIfAborted();
  const mode = layer.options.mobilityMode;
  if (!['bicycle', 'pedestrian'].includes(mode)) throw new Error(`Unknown mobility mode: ${mode}`);
  let state = cache.get(layer);
  if (!state) { state = {}; cache.set(layer, state); }
  if (!state.paths) {
    const bounds = trafficBounds(layer);
    const raw = await parisAPI('amenagements-cyclables', 'exports/geojson', {
      select: 'osm_id,nom,amenagement,geo_shape,source,date_export',
      where: boundsQuery('geo_shape', bounds),
    }, signal);
    state.paths = mobilityLanes(raw, mode, bounds);
  }
  if (mode === 'pedestrian') {
    state.paths.note = 'pedestrians: no measured counts available in this source; assumed flow on HTTP-fetched shared paths';
    return state.paths;
  }
  const { location, options: { radius = 2000 } } = layer;
  const where = `within_distance(coordinates,geom'POINT(${location.lng} ${location.lat})',${radius}m)`;
  const requested = trafficHour(time, Infinity).toISOString();
  if (state.requested === requested) return state.data;
  const latest = await parisAPI('comptage-velo-donnees-compteurs', 'records',
    { select: 'max(date) as latest', where, limit: 1 }, signal);
  const date = latest.results?.[0]?.latest;
  if (!Number.isFinite(Date.parse(date))) throw new Error('No cycling counts published');
  const counted = trafficHour(time, Date.parse(date)).toISOString();
  const counts = await parisRecords('comptage-velo-donnees-compteurs', {
    select: 'id_compteur,nom_compteur,sum_counts,date,coordinates',
    where: `${where} and date = date'${counted}'`,
  }, signal);
  const data = cyclingCounts(state.paths, counts, counted);
  if (!counts.length) data.note = `bicycles: no published counts for ${counted}; no flow simulated`;
  state.requested = requested;
  return state.data = data;
}
