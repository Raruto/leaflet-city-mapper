
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { radians } from '../globals/radians.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

export function local(output) {
  const { layer, state } = this;
  const map = layer._map, crs = map.options.crs
  const location = locationByLayer.get(layer), root = rootByLayer.get(layer);
  const origin = crs.project(location), metres = Math.cos(location.lat * radians);
  const p = crs.project(state.latlng);
  const ground = mapElevationOf(map, state.latlng) || 0;
  output[0] = (p.x - origin.x) * metres;
  output[1] = ground + (state.height ?? 0) - root.position[1];
  output[2] = -(p.y - origin.y) * metres;
  return output;
}
