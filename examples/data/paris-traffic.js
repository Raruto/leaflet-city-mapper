/**
 * Paris road traffic for the 'traffic' layer type: hourly flow measured by the city's permanent road counters
 * (Ville de Paris open data, ODbL), as GeoJSON lanes with a `flow` property (vehicles/hour).
 *
 * @example new L.Layer({ source: { type: 'traffic', url: './examples/data/paris-traffic.js', radius: 2000 } })
 */
import { parisAPI } from './paris-api.js';

const hour = 3600000, week = 7 * 24 * hour;
const cache = new WeakMap();

/** Requested hour, moved back by whole weeks when the counts are not published yet. */
export function trafficHour(date, latest) {
  const time = Math.floor(new Date(date).getTime() / hour) * hour;
  if (!Number.isFinite(time)) throw new Error('Invalid traffic date');
  return new Date(time > latest ? time - Math.ceil((time - latest) / week) * week : time);
}

/** Counts of the hour of `time` within `radius` metres of the layer; the same object is returned while the hour is unchanged. */
export default async function parisTraffic(time, layer, signal) {
  const { location, options: { radius = 2000 } } = layer;
  const where = `within_distance(geo_point_2d, geom'POINT(${location.lng} ${location.lat})', ${radius}m) and q > 0`;
  const requested = trafficHour(time, Infinity).toISOString();
  const previous = cache.get(layer);
  if (requested === previous?.requested) return previous.data;
  const { results: [last] } = await parisAPI('comptages-routiers-permanents', 'records',
    { limit: 1, select: 'max(t_1h) as hour', where }, signal);
  if (!Number.isFinite(Date.parse(last?.hour))) throw new Error('No traffic counts published');
  const counted = trafficHour(time, Date.parse(last.hour)).toISOString();
  const { features } = await parisAPI('comptages-routiers-permanents', 'exports/geojson', {
    select: 'q,libelle,geo_shape', where: `${where} and t_1h = date'${counted}'`,
  }, signal);
  if (!Array.isArray(features)) throw new Error('Invalid traffic counts');
  const label = new Date(counted).toLocaleString('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const data = {
    type: 'FeatureCollection', hour: counted,
    note: `cars: measured counts of ${label}${counted === requested ? '' : ' (same weekday, latest published)'}`,
    features: features.map(roadFeature),
  };
  if (!features.length) data.note = `cars: no published positive counts for ${counted}; no flow simulated`;
  cache.set(layer, { requested, data });
  return data;
}

function roadFeature({ geometry, properties: { q, libelle } }) {
  if (!Number.isFinite(q) || q < 0 || !['LineString', 'MultiLineString'].includes(geometry?.type)) {
    throw new Error('Invalid road counter');
  }
  return {
      type: 'Feature', geometry,
      properties: {
        flow: q,
        name: String(libelle || 'Road').replace(/_/g, ' '),
        description: `${Math.round(q)} vehicles/hour (measured)\nIllustrative vehicle, not a live position.`,
      },
  };
}
