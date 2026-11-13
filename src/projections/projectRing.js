import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { L } from '../globals/L.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

/**
 * Validate ring length and coordinates, then project its vertices except the closing point and sample terrain.
 *
 * @param {Object} context Projection state, backend layer and map.
 * @param {number[][]} ring GeoJSON polygon ring.
 *
 * @returns {Object[]} Projected points with x, y and ground coordinates.
 *
 * @throws {Error} If the ring has fewer than four positions.
 * @throws {Error} If a projected position has invalid longitude or latitude.
 */
export function projectRing(context, ring) {
  const { backend: layer, crs, origin, metres, map } = context;
  if (ring.length < 4) throw /* alloc */ new Error('Invalid GeoJSON polygon ring');
  const path = /* alloc */ [];
  const root = rootByLayer.get(layer);
  let i, lng, lat, location, point, elevation;
  for (i = 0; i < ring.length - 1; i++) {
    lng = ring[i][0], lat = ring[i][1];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw /* alloc */ new Error('Invalid GeoJSON coordinates');
    location = /* alloc */ new L.LatLng(lat, lng);
    point = crs.project(location);
    elevation = mapElevationOf(map, location);
    path.push(/* alloc */ {
      x: (point.x - origin.x) * metres,
      y: (point.y - origin.y) * metres,
      ground: Number.isFinite(elevation) && Number.isFinite(root.position[1])
        ? elevation - root.position[1] : 0,
    });
  }
  return path;
}
